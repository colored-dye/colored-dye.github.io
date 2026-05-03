---
layout: distill
title: Training Prompt-only Steering Vectors in a Principled Manner
date: 2026-05-03 12:00:00 +0800
last_updated: 2026-05-03 12:00:00 +0800
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
---


In this paper, we propose a principled training framework for *steering vectors (SVs)* and introduce *Prompt-Only Steering Vector (PrOSV)*.
Several readers (advisor, fellow students, reviewers) have complained that theoretical derivation on SV training dynamics is too dense and hard to read.
However, I hesitate to put informal interpretations into a research paper.
This post is meant to contain such informal but intuitive stuff aiming to help readers understand what we were trying to state through definitions and equations.

## TL;DR

- Stochastic gradient descent is not the panacea to all optimization problems.
- Neural network scaling theory is a useful theoretical tool to predict training dynamics.
- Rank-1 prompt-only intervention is sufficient for concept-based steering.


## Introduction

The SV approach achieves model control by adding a fixed vector to model representations.
As is shown in <a href="#prosv_vs_fssv">Figure 1</a>, most prior works apply SVs at each token position and achieves concept-based steering effectively.
However, we find that the steered model performance drops severely.
We attribute this problem to the full-sequence nature of such interventions: ***full-sequence SVs (FSSVs)* might exert too much interference in the generation process and thus harms general capabilities**.

Therefore, we hypothesize that we can better preserve model capabilities by limiting the amount of interventions.
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
  Figure 3. Loss landscape sketch to demonstrate the importance of hyperparameters on SV training dynamics (drawn by Gemini). Arbitrary initialization likely lands on high-loss plateau, after which SV training is prone to be trapped in local basins rather than global optimum. When learning rate is too large, the training process becomes unstable and might cause the training trajectory to "jump" onto plateau regions. Only when both initialization and learning rate are set properly can we ensure that the final checkpoint could land in the global optimal canyon.
</div>

