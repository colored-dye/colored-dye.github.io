---
layout: distill
title: Training Prompt-only Steering Vectors in a Principled Manner
# authors:
#   - name: Yuntai Bao
#     affiliations:
#       name: Zhejiang University
date: 2026-05-03 12:00:00 +0800
last_updated: 2026-05-05 12:00:00 +0800
description: our recent work on prompt-only SV and SV training dynamics.
tags: steering LLM
categories: tech
bibliography: 2026-05-03-prompt-only-sv.bib
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
    margin-top: -1.0rem !important;
    margin-bottom: 1.6rem !important;
    text-align: left;
  }
  mark {
    background-color: lightpink;
    color: black;
  }
---


In this paper, we propose a principled training framework for *steering vectors (SVs)* and introduce *Prompt-Only Steering Vector (PrOSV)*.
Several readers (advisor, fellow students, reviewers) have complained that theoretical derivation on SV training dynamics is too dense and hard to read.
However, I hesitate to put informal interpretations into a research paper.
This blog post is meant to contain such informal but intuitive stuff aiming to help readers understand what we were trying to state through definitions and equations.

## TL;DR

In this post, I argue that:

- Stochastic gradient descent is not the panacea to all optimization problems.
- Neural network scaling theory is a useful theoretical tool to predict training dynamics.
- Rank-1 prompt-only intervention is sufficient for concept-based steering, but not for complicated fine-tuning tasks.


## Introduction

The SV approach achieves model control by adding a fixed vector to model representations.
As is shown in <a href="#prosv_vs_fssv">Figure 1</a>, most prior works apply SVs at each token position and achieves concept-based steering effectively.
However, we find that the steered model performance drops severely.
We attribute this problem to the full-sequence nature of such interventions: ***full-sequence SVs (FSSVs)* might exert too much interference in the generation process and thus harms general capabilities**.


|Method|Prompt|Steered response|
|-|-|-|
|FSSV|Do you know something about the book  ＂the art of thinking clearly" wrote by Rolf Dobelli?|"The art of thinking clearly" is a book that delves into the intricacies of how our brains process information with vivid examples, offering insights into decision-making that resonate with viewers.  <mark>This book often incorporates various videos and graphics to illustrate its core concepts, making it engaging for digital media enthusiasts who appreciate the visual presentation of ideas.</mark>  Moreover, the book might feature interviews with experts on cognitive biases, facilitating a deeper understanding through real-life scenarios.  Furthermore, <mark>the book utilizes engaging multimedia to highlight how our thought processes contribute to clearer judgments, which could encourage viewer engagement.</mark>  Exploring this narrative further through <mark>interactive elements, such as interactive</mark> [...]|
|PrOSV|Do you know something about the book  ＂the art of thinking clearly" wrote by Rolf Dobelli?|The Art of Thinking Clearly by Rolf Dobelli is a highly regarded work that explores cognitive biases, and its content often serves as the basis for valuable videos that examine common fallacies and highlight the importance of critical thinking. These videos can effectively illustrate how to dismantle flawed reasoning found in various media, such as documentaries, news articles, or online discussions. The book's insightful principles have become a popular subject for discussions in educational channels, where visual aids and real-world examples strengthen the understanding of these cognitive shortcuts.<eos>|

<div class="caption" id="steered_responses">
  Table 1. Steered generations on `gemma-2b-it` regarding the concept "references to video and multimedia content".
  The highlighted selections are absurd generations.
</div>


We show an example in <a href="#steered_responses">Table 1</a>, where the concept is "references to video and multimedia content"
The steered with FSSV, the steered generation indeed expresses the target concept; however, the steered model describes how multimedia like videos are incorporated into the book, which is unrealistic--books cannot embed videos!
Such absurd, elementary mistakes indicate that the FSSV-steered model has degraded capabilities in basic world knowledge and/or reasoning.
In contrast, PrOSV-steered generations reasonably describes the book as the basis for videos.

We hypothesize that we can **better preserve model capabilities by limiting the amount of interventions**--just enough for concept incorporation, but not to the extent that corrupts general knowledge and reasoning capabilities.
One possible approach is to limit the number of intervened tokens and apply *prompt-only interventions*.
Beyond minimal interference, this approach has benefits in terms of computational cost since it restricts intervention to prefill stage such that intervention overhead does not scale with context length.

Prior work has shown the feasibility of the prompt-only approach to model control, including
*prefix tuning*<d-cite key="li2021prefix"></d-cite>,
*representation fine-tuning (ReFT)*<d-cite key="wu2024reft"></d-cite>,
*function vector*<d-cite key="todd2023function"></d-cite>
and *task vector*<d-cite key="hendel2023context"></d-cite>.
Among which, ReFT gives us the direct insight to apply interventions to prompt prefix and/or suffix positions.
For example, `p4` is intervention on 4 prefix tokens, `s2` is interventions on 2 suffix tokens while `p4+s2` simultaneously intervenes on prefix and suffix locations.
Since we focus on training-based methods, we do not build directly upon function vectors and task vectors but study `s1` interventions as part of our location search process.
Prefix tuning is essentially the soft prompt approach that *expands* the context rather than modifying representations *in place*, therefore we also leave it out of discussions.


<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-05-03-prompt-only-sv/prosv_vs_fssv.jpg" class="img-fluid rounded z-depth-1" zoomable=true width="70%" %}
  </div>
</div>
<div class="caption" id="prosv_vs_fssv">
  Figure 1. Full-Sequence SV (FSSV) vs. Prompt-Only SV (PrOSV). FSSV could compromise general model utility even after careful factor selection. In contrast, PrOSV achieves effective concept-based steering without sacrificing model utility.
</div>


### Joint training of steering factors and directions does *not* work out of the box

<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-05-03-prompt-only-sv/training_comparison.jpg" class="img-fluid rounded z-depth-1" zoomable=true width="70%" %}
  </div>
</div>
<div class="caption" id="training_comparison">
  Figure 2. Comparison of training/inference strategies. Traditional fine-tuned FSSVs always require post-hoc factor selection, while our joint training scheme enables end-to-end cross-concept scalability and is compatible with both FSSV and PrOSV.
</div>

The motivation for using prompt-only SV is quite straightforward, but it is not the case with special designs in SV training.
As is shown in <a href="#training_comparison">Figure 2</a>, current SV-based approaches always require a factor selection process after SV training, where steered responses are sampled using factors from a predesignated search grid.
The final factor is chosen based on the quality of steered responses.
In AxBench, the evaluation metric is *overall steering score*, which is the harmonic mean of
*concept score* (how well the concept is incorporated into a response),
*instruct score* (how well a response is related to the instruction)
and *fluency score* (how fluent a response is).
In AxBench evaluation, the common setup is to sample 10 responses each from a search grid of 14 factors for each concept--140 responses in total.
This can be costly when there are many concepts to steer.
Instead, it would be convenient to **put trained SVs to use immediately after training**.

This calls for *joint training of steering factors and directions for both FSSVs and PrOSVs*.
This approach is useful for end-to-end usage of SVs, saves the factor selection process and improves the scalability of SVs over large sets of concepts.
However, one might question that it is trivial to implement joint training and that the stochastic gradient descent algorithm would take care of the rest.
However, we found that is not the case: when we fix the steering factor to $\alpha=1$ and only train the steering direction, the resulting SV is totally unusable.

We hypothesize that this is due to the limited expressiveness of the SV.
We focus on the simplest form of SV, where a fixed vector is added to representations $\mathbf{h} \in \mathbb{R}^n$:
$\Phi(\mathbf{h}; \alpha, \mathbf{v}) = \mathbf{h} + \alpha \mathbf{v}$,
where $\mathbf{v}$ is the steering direction and $\alpha$ is the steering factor.
The functional form above is simply an input-agnostic, additive rank-1 bias; therefore, it cannot model inter-token interactions.
The SV approach $\Phi: \mathbb{R} \times \mathbb{R}^n \to \mathbb{R}^n$ is also fundamentally less expressive than ReFT-like approaches $\Phi: \mathbb{R}^n \times \mathbb{R}^n \to \mathbb{R}^n$, e.g., $\Phi(\mathbf{h}; \mathbf{w}, \mathbf{v}) = \mathbf{h} + \mathbf{v} \mathbf{w}^\top \mathbf{h}$.
As a result, the expressiveness of ReFT makes it less sensitive to hyperparameter configurations, since its functional form allows it to compensate for suboptimal initializations.
In contrast, SV requires careful selection of learning rates and initialization strategies.

Furthermore, the expressiveness bottleneck of SV is compounded by the implicit bias of the optimizer, which limits the set of reachable solutions from a certain initialization point.
The explanations above might be intuitively (but less rigorously) illustrated in <a href="#loss_landscape">Figure 3</a>.


<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-05-03-prompt-only-sv/loss_landscape.png" class="img-fluid rounded z-depth-1" zoomable=true width="70%" %}
  </div>
</div>
<div class="caption" id="loss_landscape">
  Figure 3. Loss landscape sketch to demonstrate the importance of hyperparameters on SV training dynamics (generated by Gemini).
  Arbitrary initialization likely lands on high-loss plateau, after which SV training is prone to be trapped in local basins rather than global optimum.
  When learning rate is too large, the training process becomes unstable and might cause the training trajectory to "jump" up onto plateau regions.
  Only when both initialization and learning rate are set properly can we ensure that the final checkpoint could land in the global optimal canyon.
</div>



## Relationship between PrOSV and ReFT: a training dynamics perspective

Both PrOSV and ReFT intervene on prefix/suffix positions of prompts.
Given the surprising steering effectiveness of both approach, we are interested in whether (and if so, how) the two methods are connected.
We therefore train both rank-1 LoReFT and PrOSV on a single concept from AxBench at the 10th layer of `gemma-2-2b-it`.
For PrOSV, we use the tuned initialization and training strategies; for LoReFT, we simply use the same learning rates and default initialization (i.e. Kaiming initialization).
LoReFT formula is: $\Phi(\mathbf{h}) = \mathbf{h} + \mathbf{u} \mathbf{w}^\top \mathbf{h} - \mathbf{u} \mathbf{u}^\top \mathbf{h}$ (omitting bias term), where $\mathbf{u}$ is unit vector while $\mathbf{w}$ is a free vector.
The step-wise training loss values are shown in <a href="#reft_sv_dynamics">Figure 4</a>.
Both LoReFT and PrOSV show **almost identical training dynamics**!
Furthermore, we compare cosine similarity between LoReFT output projection and PrOSV directions: the **cosine similarities are all above 96%**.


<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-05-03-prompt-only-sv/reft_sv_dynamics.png" class="img-fluid rounded z-depth-1" zoomable=true width="70%" %}
  </div>
</div>
<div class="caption" id="reft_sv_dynamics">
  Figure 4. Training dynamics of LoReFT and three variants of PrOSV: AddFree (addition intervention with free vector norm), AddUnit (addition intervention with unit vector norm) and Clamp (clamping intervention with unit vector norm).
</div>


The findings above strongly indicate that PrOSV and ReFT work via the same mechanisms, and their similarity could be explained by their intervention locations.
The models we use are instruction-tuned models with chat templates.
When intervening on prefix/suffix tokens, we are actually intervening on non-semantic filler tokens with no actual content.
For example, Gemma2 chat template is `<bos><start_of_turn>\nuser\n{instruction}<end_of_turn>\n<start_of_turn>\nmodel\n`
This means that even when we steer with the input-aware ReFT, the input representations for ReFT are basically the same across prompts.
As a result, ReFT is almost input-agnostic and effectively an SV.


## PrOSV for fine-tuning?

The ReFT paper has shown that ReFT enables fine-tuning<d-cite key="wu2024reft"></d-cite>.
Since we PrOSV and rank-1 ReFT are very similar, we are curious about whether ProSV informs general-purpose fine-tuning.
One main challenge is that, fine-tuning typically requires ReFT rank higher than 1, usually 4--8.

We steer Llama-7B to answer BoolQ questions, where we train PrOSV (p2+s2) at all layers.
FSSV and LoRA (rank 8) are also tested as baselines.
Results in <a href="#fine_tuning">Table 2</a> show that PrOSV outperforms FSSV.
Although SVs could achieve general task format alignment, they severely underperform LoRA.
Therefore rank-1 SV-based approaches likely fail to embed new task-specific knowledge but might help with superficial format alignment.


| Method  | Accuracy |
| ------- | :---: |
| Vanilla |  38   |
| FSSV    |  56   |
| PrOSV   |  63   |
| LoRA    | 68.9  |

<div class="caption" id="fine_tuning">
  Table 2. Fine-tuning results on BoolQ with Llama-7B.
</div>



## Future directions

In this work and our previous work, we focus on concept-centric steering, i.e. to incorporate or suppress a concept in model generations.
We are actively exploring the possibility for more information bandwidth beyond concepts, e.g., memorization.
Memorization of steering vectors has been tentatively explored in the Appendix of ReFT paper<d-cite key="wu2024reft"></d-cite>, where they found that a single clamping SV can memorize up to 2K tokens of the book *Alice's Adventures in Wonderland*.
The representation steering approach to memory has several appealing properties:
(a) unlike memory token approaches like ICAE and MemGen, it does not occupy input slots;
(b) it naturally allows for calibrating the tradeoff between injected external knowledge and parametric knowledge since SV is in-place editing, unlike ICL-based approaches that regard knowledge as context;
(c) it is not bounded by context window size.
