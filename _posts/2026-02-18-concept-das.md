---
layout: post
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


## Is CDAS a causal variable localization technique?

**Benchmark dataset and metric.**
I tested CDAS on the causal variable localization track of *Mechanistic Interpretability Benchmark (MIB)* <d-cite key="mueller2025mib"></d-cite>.
The subtask is MCQA, which is a multiple-choice dataset.
The high-level causal model (shown in <a href="mcqa_causal_model">Figure 1</a>) defines two important causal variables: $X_\text{order}$ and $O_\text{Answer}$, corresponding to the position of the answer and the answer token, respectively.

<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa_causal_model.png" class="img-fluid rounded z-depth-1 zoomable=true" %}
  </div>
</div>
<div class="caption" id="mcqa_causal_model">
  Figure 1. High-level causal model of multiple-choice tasks.
</div>


<div class="row mt-3">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/heatmap_answerPosition_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1 zoomable=true" %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/heatmap_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1 zoomable=true" %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/heatmap_answerPosition_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1 zoomable=true" %}
  </div>
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/heatmap_average_4_answer_MCQA.png" class="img-fluid rounded z-depth-1 zoomable=true" %}
  </div>
</div>
<div class="caption" id="results_mcqa">
  Figure 2. IIA results on MCQA task with CDAS and Gemma2-2B.
</div>

Results are shown in <a href="#results_mcqa">Figure 2</a>.


