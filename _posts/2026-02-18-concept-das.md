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
    /* Defines 2 columns, each taking up an equal fraction of the available space */
    grid-template-columns: repeat(2, 1fr);
    /* Ensures no space between the grid items */
    gap: 4px;
  }
  .image-item img {
    /* Ensures images fill their container while maintaining aspect ratio */
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Optional: Removes default image margins if any exist */
    display: block; 
  }
---

In this blog post, I would like to extend upon our recent work, <a href="https://arxiv.org/abs/2602.05234">Faithful Bi-Directional Model Steering via Distribution Matching and Distributed Interchange Interventions</a>, as well as topics beyond the scope of the paper.


## Early exploration and misconception

In early May, 2025, I was reading the series of papers by Atticus Geiger and was deeply intrigued by the causal abstraction branch of mech interp.
Specifically, I focused on *Distributed Alignment Search (DAS)* <d-cite key="geiger2024finding"></d-cite>.

We initially submitted the paper to NeurIPS 2025. However, during rebuttal, our discussions with the reviewers made us aware of the fundamental mistakes regarding the conceptual nature of our method: **CDAS should be positioned as a steering method, not a causal variable localization method**.
More specifically, CDAS is dedicated to identifying alignments between low-level representations and high-level causal variables with the **target neural network as the reference model**, whereas DAS does *not* have this constraint.
The practical implication is that, CDAS fails to align a neural network with external, high-level causal models, which is the entire purpose of causal abstraction.


## CDAS for causal abstraction?

**Benchmark dataset and metric.**
I tested CDAS on the causal variable localization track of *Mechanistic Interpretability Benchmark (MIB)* <d-cite key="mueller2025mib"></d-cite>.
The target model is Gemma2-2B.
The subtask is a multiple-choice dataset, MCQA.
The high-level causal model of multiple-choice tasks, $\mathcal{H}$ (shown in <a href="#mcqa_causal_model">Figure 1</a>) defines two important causal variables: $X_\text{Order}$ (position of the answer) and $O_\text{Answer}$ (answer token).
I thus conduct causal variable localization regarding these causal variables.

The metric is *interchange intervention accuracy (IIA)*. We now formulate this metric according to <d-cite key="mueller2025mib"></d-cite>.
Given base and counterfactual inputs $(b, c)$, the interchange intervention $\mathcal{H}_{X \leftarrow \mathrm{Get}(\mathcal{H}(c), X)}(b)$ runs $\mathcal{H}$ on base input $b$ while fixing the variable $X$ to the value it takes when $\mathcal{H}$ is run on a counterfactual input $c$.


<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa_causal_model.png" class="img-fluid rounded z-depth-1" zoomable=true width="60%" %}
  </div>
</div>
<div class="caption" id="mcqa_causal_model">
  Figure 1. High-level causal model $\mathcal{H}$ of multiple-choice tasks.
</div>

<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/counterfactual_dataset.png" class="img-fluid rounded z-depth-1" zoomable=true width="60%" %}
  </div>
</div>
<div class="caption" id="counterfactual_dataset">
  Figure 2. Counterfactuals for the multiple-choice ARC task.
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
  Figure 4. IIA results regarding $O_\text{Answer}$ on MCQA task with DAS.
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
  Figure 6. IIA results regarding $X_\text{Order}$ on MCQA task with DAS.
</div>


<div class="caption" id="results_aggregate">
  Table 1. Aggregate IIA results on MCQA task. Results outside parentheses are averaged across all layers while results inside parentheses are highest results of individual layers. Results with * are taken from <d-cite key="mueller2025mib"></d-cite>.
</div>

| Method          | $O_\text{Answer}$ | $X_\text{Order}$ |
| --------------- | :---------------: | :--------------: |
| CDAS            |      89 (95)      |     46 (53)      |
| DAS$^*$         |      88 (94)      |     76 (88)      |
| DBM$^*$         |      82 (99)      |     63 (80)      |
| Full vector$^*$ |     63 (100)      |     43 (74)      |


**Results.**
CDAS results are shown in <a href="#results_cdas_answer">Figure 3</a> and <a href="#results_cdas_answer_pointer">Figure 5</a>, while DAS results (taken from <d-cite key="mueller2025mib"></d-cite>) are shown in <a href="#results_das_answer">Figure 4</a> and <a href="#results_das_answer">Figure 6</a>.
Comparing Figure 3 and 4, we can see that CDAS and DAS display qualitatively similar layer-wise performance for $O_\text{Answer}$.
However, CDAS often yields low IIAs for $X_\text{Order}$ except for the `answerPosition` and `randomLetter` counterfactuals.

Aggregate results are shown in <a href="#results_aggregate">Table 1</a>.
The averaged CDAS performance with respect to $O_\text{Answer}$ is on par with DAS.
However, its average performance with respect to $X_\text{Order}$ is only comparable to the unsupervised full-vector intervention baseline.


**Takeaway.**
CDAS can only be used to control model output content, *not* the inner causal variables of high-level causal models.


---

If you found this post useful, please cite as:

```bibtex
@article{bao2026concept_das,
  title   = {Concept Distributed Alignment Search for Faithful Representation Steering},
  author  = {Bao, Yuntai},
  year    = {2026},
  month   = {Feb},
  url     = {https://colored-dye.github.io/blog/2026/concept-das/}
}
```
