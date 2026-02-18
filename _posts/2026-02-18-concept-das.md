---
layout: post
title: Concept Distributed Alignment Search
date: 2026-02-18 19:00:00 +0800
description: discussions regarding my recent work on faithful representation steering.
tags: steering LLM
categories: tech
bibliography: 2026-02-18-concept-das.bib
related_posts: false
giscus_comments: true
---

In this blog post, I would like to extend our discussions of our recent work, <a href="https://arxiv.org/abs/2602.05234">Faithful Bi-Directional Model Steering via Distribution Matching and Distributed Interchange Interventions</a>, as well as topics beyond the scope of the paper.


## Early exploration and misconception

In early May, 2025, I was reading the series of papers by Atticus Geiger and was deeply intrigued by the causal abstraction branch of mech interp.
Specifically, I focused on *Distributed Alignment Search (DAS)*<d-cite key="geiger2024finding"></d-cite> and *Boundless DAS*<d-cite key="wu2023interpretability"></d-cite>.

## Is CDAS a causal variable localization technique?


<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/heatmap_answerPosition_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/heatmap_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/heatmap_answerPosition_randomLetter_test_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/2026-02-18-concept-das/mcqa-gemma2-cdas/heatmap_average_4_answer_MCQA.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    IIA results on MCQA task with CDAS and Gemma2-2B.
</div>
