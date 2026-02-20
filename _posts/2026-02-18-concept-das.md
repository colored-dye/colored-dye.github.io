---
layout: distill
title: Concept Distributed Alignment Search for Faithful Representation Steering
date: 2026-02-18 19:00:00 +0800
last_updated: 2026-02-19 12:00:00 +0800
description: discussions regarding our recent work on faithful representation steering.
tags: steering LLM
categories: tech
bibliography: 2026-02-18-concept-das.bib
related_posts: false
giscus_comments: true
featured: true
toc: true
citation: true

_styles: >
  .grid-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 4px;
  }
  .image-item img {
    object-fit: cover;
    display: block; 
  }
  .caption {
    margin-top: -0.5rem !important;
    margin-bottom: 1.6rem !important;
  }
---

In this blog post, I would like to extend upon our recent work, <a href="https://arxiv.org/abs/2602.05234">Faithful Bi-Directional Model Steering via Distribution Matching and Distributed Interchange Interventions</a>, as well as topics beyond the scope of the paper.


## Early exploration and misconception--theoretical discussions

In early 2025, I was deeply intrigued by the causal abstraction branch of mechanistic interpretability and was working on improving *Distributed Alignment Search (DAS)* <d-cite key="geiger2024finding,wu2023interpretability,geiger2025causal"></d-cite>, such that the resulting causal abstraction technique is able to learn from probabilistic intricacies.
This is motivated by the fact that DAS only learns subspace projections using discrete labels and does not fully utilize the probabilistic information of the target labels.
Suppose we are trying to localize the fact retrieval feature. Given a prompt in a QA task, `New York is in the country of`, multiple responses could be considered factually correct: `the U.S.`, `the United States`, `America`. By setting the answer to be strictly `U.S.` under greedy decoding might deviate from the model's inherent tendencies since the model might prefer a different but semantically similar answer.
By explicitly incorporating probabilities in the training objective of causal abstraction methods, we might be able to utilize the curated constant labels in a manner that is more faithful to the model of interest, without sampling labels from the target model and filtering for useful ones in a model-specific manner.

We initially submitted the paper to NeurIPS 2025. However, our discussions with the reviewers made us aware of a fundamental mistake regarding the conceptual nature of our method: **CDAS should be positioned as a steering method, not a causal variable localization method**.
More specifically, CDAS is dedicated for a subset of causal variables: those directly related to outputs or properties of outputs, e.g., output tokens and output-oriented concepts.
These variables are usually leaf nodes of causal graphs or single parents of leaf nodes (e.g., `Y, Z` when the causal graph is a linear chain `X -> Y -> Z` or `Y, Z` when the graph is `X1 -> Y, X2 -> Y, Y -> Z`).
The practical implication is that CDAS fails to accomplish general-purpose causal abstraction like DAS.

We use the case of multiple-choice task to help readers understand.
The high-level causal model of multiple-choice tasks, $\mathcal{H}$ (shown in <a href="#mcqa_causal_model">Figure 1</a>) defines two important causal variables: $X_\text{Order}$ (position of the answer) and $O_\text{Answer}$ (answer token).
According to Mueller et al. <d-cite key="mueller2025mib"></d-cite>, this is driven by the hypothesis that an LM accomplishes multiple-choice tasks in two steps with binding mechanism <d-cite key="dai2024representational"></d-cite>:
it computes the index for its answer before retrieving the choice letter from the prompt with the index.


<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa_causal_model.png" class="img-fluid rounded z-depth-1" zoomable=true width="70%" %}
  </div>
</div>
<div class="caption" id="mcqa_causal_model">
  Figure 1. High-level causal model $\mathcal{H}$ of multiple-choice tasks.
</div>


Let base inputs be $b$ with choices `A, B, C, D` and the correct choice letter is $y^b = \verb|C|$, then the choice index is 2.
Let counterfactual inputs be $c$ with choices `E, F, G, H` and the correct choice letter is $y^c = \verb|F|$, then the choice index is 1.
$b,c$ are essentially the same question, except that $c$ shuffles the order of choices and replaces choice letters.
After interchange intervention on the $X_\text{Order}$ variable, the intervened output has the same choice index 1 as when inputs are $c$.
Therefore intervening on base inputs $b$ yields a counterfactual choice letter: $y^{b*}=\verb|B|$.

Recall that positive term of the CDAS training objective is as follows:

$$
D_{\Phi}^+ = \frac{1}{\vert y^c \vert} \sum_{k=1}^{\vert y^c \vert} D_{\mathrm{JS}}\left( \mathbf{p}_{\Phi} \left( \cdot \vert y ^c _{\lt k}, b; \mathbf{h} \leftarrow \Phi^{\mathrm{DII}}(c) \right) \big\| \mathbf{p} \left( \cdot \vert y^c _{\lt k},c \right) \right).
$$

The problem is that, when conditioned with counterfactual inputs $c$, the un-intervened probabilities on counterfactual labels $y^{b\*}$, i.e. $p(y^{b\*} \vert c)$, is low since $y^{b\*} \neq y^c$.
As a result, the counterfactual label does not provide sufficient signal to optimize for alignment and the resulting intervention does not correspond to features of the target causal variable.
The cause of this problem is that this counterfactual label is the **composite** of answer index and input prompt and it is not even a plausible answer given counterfactual inputs.
In contrast, DAS does not suffer from this problem since the loss signal comes from constant external labels, not model-induced probability distributions.

Acknowledging this problem, we treat the CDAS method as identifying features for output-oriented concepts that directly informs concept-based steering. To make this point clear, we also mention that CDAS is *not* a general-purpose causal abstraction method in the main body of our paper:

> Remark (CDAS is not causal variable localization). While CDAS draws inspiration from DAS, it should not be viewed as a causal variable localization method: DAS assumes access to a high-level algorithm with near-perfect supervision; whereas our goal is not to identify ground-truth causal variables, but to find useful features that enable faithful steering. Thus, CDAS is best understood as a steering method motivated by causal variable localization principles.


## CDAS for causal abstraction?--an empirical analysis

**Benchmark dataset and metric.**
I tested CDAS on the causal variable localization track of *Mechanistic Interpretability Benchmark (MIB)* <d-cite key="mueller2025mib"></d-cite>.
The target model is Gemma2-2B.
We study three tasks: two multiple-choice datasets, MCQA and ARC, as well as two-digit addition.
For the multiple-choice tasks, I conduct causal variable localization regarding the causal variables $X_\text{Order}$ and $O_\text{Answer}$.
For the two-digit addition task, I study $X_\text{Carry}$, the carry value of the "carry-the-one" algorithm that LMs are assumed to implement.

The dataset consists of three subsets, corresponding to three types of counterfactuals: `answerPosition` (only change the orders of choices), `randomLetter` (only change the choice letters) and `answerPosition_randomLetter` (change both choice orders and letters).
Examples of these counterfactuals are shown in <a href="#counterfactual_dataset">Figure 2</a>.

Intervention positions include the last token (`last_token`) and the choice letter of the correct answer (`correct_symbol`).

The metric is *interchange intervention accuracy (IIA)*. We now formulate this metric according to <d-cite key="mueller2025mib"></d-cite>.
Given base and counterfactual inputs $(b, c)$, the interchange intervention $\mathcal{H}_{X \leftarrow \mathrm{Get}(\mathcal{H}(c), X)}(b)$ runs $\mathcal{H}$ on base input $b$ while fixing the variable $X$ to the value it takes when $\mathcal{H}$ is run on a counterfactual input $c$.


<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/counterfactual_dataset.png" class="img-fluid rounded z-depth-1" zoomable=true width="60%" %}
  </div>
</div>
<div class="caption" id="counterfactual_dataset">
  Figure 2. Counterfactuals for the multiple-choice ARC task (taken from <d-cite key="mueller2025mib"></d-cite>).
</div>


<div class="grid-container">
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer/heatmap_answerPosition_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer/heatmap_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer/heatmap_answerPosition_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer/heatmap_average_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
</div>
<div class="caption" id="results_cdas_answer">
  Figure 3. IIA results regarding $O_\text{Answer}$ on MCQA task with CDAS.
</div>


<div class="grid-container">
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer/heatmap_answerPosition_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer/heatmap_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer/heatmap_answerPosition_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer/heatmap_average_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
</div>
<div class="caption" id="results_das_answer">
  Figure 4. IIA results regarding $O_\text{Answer}$ on MCQA task with DAS (taken from <d-cite key="mueller2025mib"></d-cite>).
</div>


<div class="grid-container">
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer_pointer/heatmap_answerPosition_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer_pointer/heatmap_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer_pointer/heatmap_answerPosition_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer_pointer/heatmap_average_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
</div>
<div class="caption" id="results_cdas_answer_pointer">
  Figure 5. IIA results regarding $X_\text{Order}$ on MCQA task with CDAS.
</div>


<div class="grid-container">
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer_pointer/heatmap_answerPosition_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer_pointer/heatmap_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer_pointer/heatmap_answerPosition_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="image-item">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer_pointer/heatmap_average_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
</div>
<div class="caption" id="results_das_answer_pointer">
  Figure 6. IIA results regarding $X_\text{Order}$ on MCQA task with DAS (taken from <d-cite key="mueller2025mib"></d-cite>).
</div>


| Method          | $O_\text{Answer}$ | $X_\text{Order}$ |
| --------------- | :---------------: | :--------------: |
| CDAS            |      89 (95)      |     46 (53)      |
| DAS$^*$         |      95 (97)      |     77 (93)      |
| DBM$^*$         |      84 (99)      |     63 (84)      |
| Full vector$^*$ |     61 (100)      |     44 (77)      |

<div class="caption" id="results_aggregate_mcqa">
  Table 1. Aggregate IIA results on MCQA task. IIA of a single layer is averaged across intervention positions and counterfactuals. Results outside parentheses are averaged across all layers while results inside parentheses are highest results across all layers. Results with * are taken from <d-cite key="mueller2025mib"></d-cite>.
</div>


| Method          | $O_\text{Answer}$ | $X_\text{Order}$ |
| --------------- | :---------------: | :--------------: |
| CDAS            |      93 (97)      |     42 (61)      |
| DAS$^*$         |      88 (94)      |     76 (88)      |
| DBM$^*$         |      82 (99)      |     63 (80)      |
| Full vector$^*$ |     63 (100)      |     43 (74)      |

<div class="caption" id="results_aggregate_arc">
  Table 2. Aggregate IIA results on ARC task. IIA of a single layer is averaged across intervention positions and counterfactuals. Results outside parentheses are averaged across all layers while results inside parentheses are highest results across all layers. Results with * are taken from <d-cite key="mueller2025mib"></d-cite>.
</div>


| Method          | $X_\text{Carry}$ |
| --------------- | :--------------: |
| CDAS            |     27 (31)      |
| DAS$^*$         |     31 (35)      |
| DBM$^*$         |     32 (44)      |
| Full vector$^*$ |     29 (35)      |

<div class="caption" id="results_aggregate_addition">
  Table 3. Aggregate IIA results on the two-digit addition task. IIA of a single layer is averaged across intervention positions and counterfactuals. Results outside parentheses are averaged across all layers while results inside parentheses are highest results across all layers. Results with * are taken from <d-cite key="mueller2025mib"></d-cite>.
</div>


**Results.**
Layer-wise CDAS results are shown in <a href="#results_cdas_answer">Figure 3</a> and <a href="#results_cdas_answer_pointer">Figure 5</a>, while layer-wise DAS results are shown in <a href="#results_das_answer">Figure 4</a> and <a href="#results_das_answer">Figure 6</a>.
Comparing Figure 3 and 4, we can see that CDAS and DAS display qualitatively similar layer-wise performance for $O_\text{Answer}$.
However, CDAS often yields low IIAs for $X_\text{Order}$ except for the `answerPosition` counterfactual.

Aggregate results are shown in <a href="#results_aggregate_mcqa">Table 1</a>, <a href="#results_aggregate_arc">Table 2</a> and <a href="#results_aggregate_addition">Table 3</a>.
IIA averaged across all layers tells us about the robustness of a causal variable localization, whereas the highest IAA of an individual layer yields the best IIA result obtained through layer-wise search.
On the two multiple-choice tasks, the averaged CDAS performance with respect to $O_\text{Answer}$ is on par with DAS.
However, its average performance with respect to $X_\text{Order}$ and $X_\text{Carry}$ is only comparable to the unsupervised full-vector baseline.
The underperformance result indicates that CDAS fails to identify useful features for $X_\text{Order}$ and $X_\text{Carry}$.
Both the positive and negative empirical results support our previous analysis that CDAS is not useful for internal 

**Takeaway.**
CDAS can only be used to align neural representations with high-level variables directly related to output content or properties of outputs, *not* the internal causal variables of high-level causal models.



