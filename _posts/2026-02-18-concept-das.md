---
layout: distill
title: Concept Distributed Alignment Search for Faithful Representation Steering
date: 2026-02-18 19:00:00 +0800
description: discussions regarding our recent work on faithful representation steering.
tags: steering LLM
categories: tech
bibliography: 2026-02-18-concept-das.bib
related_posts: false
giscus_comments: true
featured: true
toc: true
citation: true
---

In this blog post, I would like to extend our discussions of our recent work, <a href="https://arxiv.org/abs/2602.05234">Faithful Bi-Directional Model Steering via Distribution Matching and Distributed Interchange Interventions</a>, as well as topics beyond the scope of the paper.


## Early exploration and misconception

In early May, 2025, I was reading the series of papers by Atticus Geiger and was deeply intrigued by the causal abstraction branch of mech interp.
Specifically, I focused on *Distributed Alignment Search (DAS)* <d-cite key="geiger2024finding"></d-cite> and *Boundless DAS* <d-cite key="wu2023interpretability"></d-cite>.

We initially submitted the paper to NeurIPS 2025. However, during rebuttal, our discussions with the reviewers made us aware of the fundamental mistakes regarding the conceptual nature of our method: **CDAS should be positioned as a steering method, not a causal variable localization method**.
More specifically, CDAS is dedicated to identifying alignments between low-level representations and high-level causal variables with the **target neural network as the reference model**, whereas DAS does *not* have this constraint.
The practical implication is that, CDAS fails to align a neural network with external, high-level causal models, which is the entire purpose of causal abstraction.


## CDAS for causal abstraction?

**Benchmark dataset and metric.**
I tested CDAS on the causal variable localization track of *Mechanistic Interpretability Benchmark (MIB)* <d-cite key="mueller2025mib"></d-cite>.
The subtask is MCQA, which is a multiple-choice dataset.
The high-level causal model (shown in <a href="#mcqa_causal_model">Figure 1</a>) defines two important causal variables: $X_\text{Order}$ and $O_\text{Answer}$, corresponding to the position of the answer and the answer token, respectively.

<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa_causal_model.png" class="img-fluid rounded z-depth-1" zoomable=true width="60%" %}
  </div>
</div>
<div class="caption" id="mcqa_causal_model">
  Figure 1. High-level causal model of multiple-choice tasks.
</div>


<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer/heatmap_answerPosition_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer/heatmap_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
</div>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer/heatmap_answerPosition_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer/heatmap_average_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
</div>
<div class="caption" id="results_cdas_answer">
  Figure 2. IIA results regarding $O_\text{Answer}$ on MCQA task with CDAS and Gemma2-2B.
</div>

<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer/heatmap_answerPosition_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer/heatmap_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
</div>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer/heatmap_answerPosition_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer/heatmap_average_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
</div>
<div class="caption" id="results_das_answer">
  Figure 3. IIA results regarding $O_\text{Answer}$ on MCQA task with DAS and Gemma2-2B.
</div>

<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer_pointer/heatmap_answerPosition_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer_pointer/heatmap_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
</div>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer_pointer/heatmap_answerPosition_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/answer_pointer/heatmap_average_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
</div>
<div class="caption" id="results_cdas_answer_pointer">
  Figure 4. IIA results regarding $X_\text{Order}$ on MCQA task with CDAS and Gemma2-2B.
</div>

<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer_pointer/heatmap_answerPosition_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer_pointer/heatmap_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
</div>
<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer_pointer/heatmap_answerPosition_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-das/answer_pointer/heatmap_average_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
  </div>
</div>
<div class="caption" id="results_das_answer_pointer">
  Figure 5. IIA results regarding $X_\text{Order}$ on MCQA task with DAS and Gemma2-2B.
</div>

**Results.**
CDAS results are shown in <a href="#results_cdas_answer">Figure 2</a> and <a href="#results_cdas_answer_pointer">Figure 4</a>, while DAS results are shown in <a href="#results_das_answer">Figure 3</a> and <a href="#results_das_answer">Figure 5</a>.
Comparing Figure 2 and 3, we can see that CDAS and DAS display qualitatively similar layer-wise performance for $O_\text{Answer}$.
However, CDAS often yields low IIAs for $X_\text{Order}$ except for the `answerPosition` subset.

**Takeaway.**
CDAS can only be used to control model outputs, *not* the inner causal variables of high-level causal models.

