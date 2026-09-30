---
layout: distill
title: Scaling Properties of Same-Family On-Policy Distillation
date: 2026-09-30 12:00:00 +0800
description: how much RL-acquired capability transfers across model scales via on-policy distillation, how fast, and how to predict it before training.
tags: OPD LLM scaling RL
categories: tech
bibliography: 2026-09-30-opd-scaling.bib
related_posts: false
giscus_comments: true
featured: true
toc: true
citation: false
pretty_table: true
chart:
  plotly: true

authors:
  - name: Yuntai Bao
    affiliations:
      name: Zhejiang University
  - name: Qinfeng Li
    affiliations:
      name: Zhejiang University
  - name: Guoqing Jiang
    affiliations:
      name: Kuaishou Technology
  - name: Liwei Chen
    affiliations:
      name: Kuaishou Technology
  - name: Zhiheng Qin
    affiliations:
      name: Kuaishou Technology
  - name: Xuanping Li
    affiliations:
      name: Kuaishou Technology
  - name: Wenqi Zhang
    affiliations:
      name: Zhejiang University
  - name: Xuhong Zhang
    affiliations:
      name: Zhejiang University

_styles: >
  .opd-pills { display: flex; flex-wrap: wrap; gap: 10px; margin: 0.25rem 0 1.5rem; }
  .opd-pills a {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 7px 16px; border-radius: 999px;
    border: 1px solid var(--global-theme-color);
    color: var(--global-theme-color) !important;
    font-size: 0.95rem; font-weight: 600; text-decoration: none !important;
    transition: background-color .15s, color .15s;
  }
  .opd-pills a:hover { background: var(--global-theme-color); color: var(--global-bg-color) !important; }
  .opd-pills a.primary { background: var(--global-theme-color); color: var(--global-bg-color) !important; }
  .opd-pills a.primary:hover { opacity: .88; }
  .paper-fig {
    background: #fff; border-radius: 12px; padding: 14px;
    border: 1px solid var(--global-divider-color);
    box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06);
    margin: 1.25rem 0 0.5rem;
  }
  .paper-fig figure { margin: 0 !important; }
  .paper-fig img { border-radius: 4px; }
  .paper-fig.narrow { max-width: 560px; margin-left: auto; margin-right: auto; }
  .caption { margin-top: 0.4rem !important; margin-bottom: 1.8rem !important; text-align: left; font-size: 0.88rem; color: var(--global-text-color-light); }
  .caption b { color: var(--global-text-color); }
  .tldr {
    position: relative; border-radius: 14px; padding: 1.3rem 1.4rem 1.1rem;
    margin: 1.5rem 0 2rem;
    border: 1px solid var(--global-divider-color);
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--global-theme-color) 9%, transparent), transparent 60%),
      var(--global-bg-color);
  }
  .tldr .tag {
    display: inline-block; font-size: 0.72rem; font-weight: 700; letter-spacing: .12em;
    text-transform: uppercase; color: var(--global-theme-color); margin-bottom: .35rem;
  }
  .tldr p.lead { font-size: 1.12rem; line-height: 1.55; margin-bottom: 1rem; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .stat {
    border-radius: 10px; padding: .75rem .8rem;
    background: var(--global-bg-color);
    border: 1px solid var(--global-divider-color);
  }
  .stat .num { font-size: 1.55rem; font-weight: 700; line-height: 1.15; color: var(--global-text-color); font-variant-numeric: tabular-nums; }
  .stat .lbl { font-size: 0.8rem; line-height: 1.35; color: var(--global-text-color-light); margin-top: .25rem; }
  .kicker {
    display: inline-block; margin-top: 2.4rem; margin-bottom: -0.6rem;
    font-size: 0.74rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
    color: var(--global-theme-color);
  }
  .takeaway {
    border-left: 3px solid var(--global-theme-color);
    background: color-mix(in srgb, var(--global-theme-color) 6%, transparent);
    border-radius: 0 10px 10px 0; padding: .8rem 1rem; margin: 1.2rem 0 1.6rem;
  }
  .takeaway p { margin: 0; }
  .setups { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 1rem 0 1.4rem; }
  .setup { border: 1px solid var(--global-divider-color); border-radius: 10px; padding: .7rem .85rem; }
  .setup .h { font-weight: 700; font-size: .95rem; color: var(--global-text-color); }
  .setup .d { font-size: .85rem; color: var(--global-text-color-light); line-height: 1.4; margin-top: .2rem; }
  .viz {
    border: 1px solid var(--global-divider-color); border-radius: 14px;
    padding: .9rem 1rem .6rem; margin: 1.25rem 0 0.4rem;
  }
  .viz-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; margin-bottom: .4rem; }
  .viz-bar .lab { font-size: .78rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--global-text-color-light); }
  .seg { display: inline-flex; border: 1px solid var(--global-divider-color); border-radius: 999px; padding: 2px; }
  .seg button {
    border: 0; background: transparent; color: var(--global-text-color);
    font-size: .85rem; padding: 3px 11px; border-radius: 999px; cursor: pointer;
  }
  .seg button[aria-pressed="true"] { background: var(--global-theme-color); color: var(--global-bg-color); font-weight: 600; }
  .seg button:focus-visible { outline: 2px solid var(--global-theme-color); outline-offset: 1px; }
  .plot { width: 100%; height: 440px; }
  .plot.square { height: 460px; }
  .replay { display: inline-flex; align-items: center; gap: 10px; margin-left: auto; }
  .replay .play {
    border: 1px solid var(--global-divider-color); background: transparent; color: var(--global-text-color);
    font-size: .8rem; padding: 3px 12px; border-radius: 999px; cursor: pointer; min-width: 5.6rem;
  }
  .replay .play:hover { border-color: var(--global-theme-color); }
  .replay .play:focus-visible { outline: 2px solid var(--global-theme-color); outline-offset: 1px; }
  .step-readout { font-size: .8rem; color: var(--global-text-color-light); font-variant-numeric: tabular-nums; min-width: 7.5rem; }
  .viz-note { font-size: .8rem; color: var(--global-text-color-light); min-height: 1.2em; }
  .calc { display: grid; grid-template-columns: minmax(220px, 1fr) 1.6fr; gap: 18px; align-items: start; }
  .calc label { display: block; font-size: .85rem; color: var(--global-text-color-light); margin: .4rem 0 0; }
  .calc label b { color: var(--global-text-color); font-variant-numeric: tabular-nums; float: right; }
  .calc input[type=range] { width: 100%; accent-color: var(--global-theme-color); }
  .calc .presets { display: flex; flex-wrap: wrap; gap: 6px; margin: .5rem 0 .8rem; }
  .calc .presets button, .calc #calc-snap {
    font-size: .78rem; border: 1px solid var(--global-divider-color); background: transparent;
    color: var(--global-text-color); border-radius: 999px; padding: 2px 10px; cursor: pointer;
  }
  .calc .presets button:hover, .calc #calc-snap:hover { border-color: var(--global-theme-color); }
  .calc .out { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: .8rem; }
  .calc .out .stat .num { font-size: 1.3rem; }
  .calc .cap { font-size: .8rem; color: var(--global-text-color-light); margin-top: .5rem; }
  .design { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 1rem 0 1.5rem; }
  .design .card { border: 1px solid var(--global-divider-color); border-radius: 12px; padding: .8rem; display: flex; flex-direction: column; }
  .design .card .paper-fig { margin: 0 0 .6rem; padding: 8px; box-shadow: none; }
  .design .card h4 { font-size: 1rem; margin: .2rem 0 .3rem; }
  .design .card p { font-size: .88rem; line-height: 1.45; margin: 0; }
  d-article table { font-size: .9rem; }
  @media (max-width: 768px) {
    .stats { grid-template-columns: repeat(2, 1fr); }
    .setups, .design, .calc { grid-template-columns: 1fr; }
    .plot { height: 360px; }
    .plot.square { height: 380px; }
  }
---

<div class="opd-pills">
  <a class="primary" href="https://arxiv.org/abs/2609.32722"><i class="ai ai-arxiv"></i> arXiv 2609.32722</a>
  <a href="https://arxiv.org/pdf/2609.32722"><i class="fa-solid fa-file-pdf"></i> PDF</a>
  <a href="https://x.com/colored_dye/status/2105290534969561508"><i class="fa-brands fa-x-twitter"></i> Thread</a>
  <a href="#citation"><i class="fa-solid fa-quote-right"></i> BibTeX</a>
</div>

<div class="paper-fig">
  {% include figure.liquid loading="eager" path="assets/img/2026-09-30-opd-scaling/banner.png" class="img-fluid" zoomable=true alt="Overview: OPD setups, two-phase training dynamics, and the joint power law" %}
</div>
<div class="caption" id="fig-overview">
  <b>Overview.</b> Left: the three teacher–student setups, with post-RL experts as teachers and SFT bases as students.
  Center: gold score rises linearly with KL-indexed training progress $d$ during the useful-transfer phase, after which dynamics turn noisy.
  Right: the fitted joint power law predicts peak gold error from teacher and student scale.
</div>

<div class="tldr">
  <div class="tag">TL;DR</div>
  <p class="lead">
    On-policy distillation (OPD) from a small RL-trained expert reliably lifts much larger students, and the outcome is <b>predictable before training</b>:
    gold score first rises <b>linearly in $\sqrt{\mathrm{KL}}$</b>, and the peak follows a <b>power law</b> in student size, teacher size, and teacher score.
  </p>
  <div class="stats">
    <div class="stat"><div class="num">0.93–0.99</div><div class="lbl">$R^2$ of a straight line $G(d)=c+md$ over the first 30 checkpoints, across all 25 runs</div></div>
    <div class="stat"><div class="num">10 / 10</div><div class="lbl">weak-to-strong pairs whose student peaks above its teacher's own score</div></div>
    <div class="stat"><div class="num">≤ 0.7 pt</div><div class="lbl">error of the joint peak law when extrapolating to the held-out largest student or teacher</div></div>
    <div class="stat"><div class="num">−19.4 pt</div><div class="lbl">peak cost of one epoch of off-policy SFT cold start (0.5B teacher → 14B student)</div></div>
  </div>
</div>

## The question

Reinforcement learning (RL) instills strong reasoning skills in LLMs, but it is expensive to repeat at every model size.
**On-policy distillation** offers a shortcut: a teacher scores every token of rollouts sampled from the _student_, and the student learns from that dense signal<d-cite key="agarwal2024onpolicy,gu2024minillm,lu2025onpolicydistillation"></d-cite>.
We ask one central question:

> **Can we estimate the performance of the distilled student from teacher and student scale, _before_ running OPD?**

We borrow the roadmap of reward-model overoptimization<d-cite key="gao2023scaling"></d-cite>.
OPD also optimizes the student against a proxy, namely the token-level implicit reward of a fixed teacher.
So we track held-out accuracy, the **gold score** $G$, as a function of how far the student has moved from its initialization:

$$
d \coloneqq \sqrt{k_3(\pi_\theta, \pi_\mathrm{ref})},
\qquad
k_3 = \mathbb{E}\Big[\tfrac{1}{|y|}\textstyle\sum_t e^{\delta_t} - \delta_t - 1\Big],
\quad
\delta_t = \log \pi_\mathrm{ref}(y_t \mid x, y_{<t}) - \log \pi_\theta(y_t \mid x, y_{<t}),
$$

where $k_3$ is the nonnegative, unbiased estimator of token-mean reverse KL<d-cite key="schulman2020kl"></d-cite>.

## Setup

We study **Qwen2.5 base models at 0.5B, 1.5B, 3B, 7B and 14B**<d-cite key="qwen2024qwen25"></d-cite>.
Every model first gets a short SFT phase.
Teachers are then trained with GRPO<d-cite key="shao2024deepseekmath"></d-cite> on the mixed GSM8K + MATH training split (14.8K problems), and gold score is accuracy on the mixed held-out test split (6.3K problems).
Crossing all five teachers with all five students gives **25 teacher–student pairs**:

<div class="setups">
  <div class="setup"><div class="h">↗ Weak-to-strong</div><div class="d">small RL expert teaches a larger SFT student (10 pairs)</div></div>
  <div class="setup"><div class="h">→ Same-base</div><div class="d">teacher and student share a base size (5 pairs)</div></div>
  <div class="setup"><div class="h">↘ Strong-to-weak</div><div class="d">classic distillation into a smaller student (10 pairs)</div></div>
</div>

<details><summary><b>The objectives we compare</b> (click to expand)</summary>

<p><b>Vanilla-OPD</b> minimizes reverse KL to the teacher. With the widely used zero-discount update, each sampled token gets the advantage</p>

$$
A_t^{\mathrm{V}} = \log \pi_T(y_t \mid x, y_{<t}) - \log \pi_\theta(y_t \mid x, y_{<t}).
$$

<p><b>Delta-OPD</b> rewards the <i>policy shift</i> the teacher acquired during RL, relative to its own pre-RL checkpoint $\pi_T^{\mathrm{base}}$. A KL penalty to the student's own initialization is added. This is the common core of OPD², Direct-OPD and W2S-OPD<d-cite key="heo2026opd2,feng2026directopd,yu2026w2sopd"></d-cite>:</p>

$$
A_t^{\Delta} = \log \pi_T(y_t \mid x, y_{<t}) - \log \pi_T^{\mathrm{base}}(y_t \mid x, y_{<t}).
$$

<p><b>Off-policy distillation (OffPD)</b> is plain SFT on teacher rollouts, $\min_\theta \mathbb{E}_{y\sim\pi_T}[-\log \pi_\theta(y\mid x)]$.</p>

<p>All training uses the verl framework<d-cite key="sheng2025hybridflow"></d-cite>. Each OPD run lasts at most 580 updates, which is ten epochs, and the held-out set is evaluated periodically.</p>
</details>

<div class="kicker">Finding 1</div>

## Transfer starts with a straight line in √KL

Every run begins with a regular **useful-transfer regime**, in which gold score rises approximately linearly in $d$:
$G(d) = c + m\,d$.
Linear fits to the first 30 checkpoints reach $R^2 \in [0.932, 0.988]$ across all 25 Vanilla-OPD runs, with slopes $m \in [0.175, 0.721]$.
After the **transfer endpoint** $d\_\mathrm{transfer}$, dynamics turn noisy and heterogeneous.
Some runs keep improving more slowly, some saturate, and some regress.
We define the endpoint as the last $d$ before the trajectory leaves the 95% predictive band of its initial line for three consecutive checkpoints.

Explore every trajectory below.
Pick a student size, then compare how each teacher drives it.

<div id="opd-viz-data" data-base="{{ '/assets/json/2026-09-30-opd-scaling/' | relative_url }}"></div>

<div class="viz">
  <div class="viz-bar">
    <span class="lab">Student</span>
    <div class="seg" data-group="student" role="group" aria-label="student size">
      <button data-value="0.5" aria-pressed="false">0.5B</button>
      <button data-value="1.5" aria-pressed="false">1.5B</button>
      <button data-value="3" aria-pressed="false">3B</button>
      <button data-value="7" aria-pressed="true">7B</button>
      <button data-value="14" aria-pressed="false">14B</button>
    </div>
    <span class="lab">Objective</span>
    <div class="seg" data-group="method" role="group" aria-label="OPD objective">
      <button data-value="vanilla_opd" aria-pressed="true">Vanilla</button>
      <button data-value="delta_opd" aria-pressed="false">Delta</button>
    </div>
    <span class="replay"><button class="play" type="button" aria-pressed="true">❚❚ Pause</button><span class="step-readout"></span></span>
  </div>
  <div id="chart-traj" class="plot"></div>
  <div class="viz-note"></div>
</div>
<div class="caption" id="fig-traj">
  <b>Interactive: gold-score trajectories.</b> Each colored curve is one OPD run, with darker colors for larger teachers.
  Dashed lines are the linear fits to the first 30 checkpoints (40 for Delta-OPD), drawn up to each run's transfer endpoint.
  A vertical tick marks runs that depart from their line within the observed range.
  Stars mark peaks, and the dotted level is direct RL on the student itself.
  Dots replay training: all runs advance one update at a time, so runs that cover more $d$ per update move faster along the axis.
  Every curve is one run.
</div>

<details><summary><b>Why does √KL linearize transfer?</b></summary>
<p>Along a smooth training path, the gold score changes to <i>first</i> order in the parameter perturbation, while KL changes to <i>second</i> order. Taking the square root of KL puts both on the same footing:</p>

$$
G(d) = G_0 + m\,d + O(d^2),
\qquad
m = \sqrt{2}\,\frac{g_0^\top h}{\sqrt{h^\top F_{\mathrm{tok}}\, h}},
$$

<p>where $g_0$ is the gold-score gradient, $h$ the update direction, and $F_{\mathrm{tok}}$ the token-weighted Fisher matrix. The slope is the Fisher-normalized alignment of the update with the gold-score gradient. How long the line persists is an empirical matter.</p>
</details>

<div class="takeaway"><p>
<b>Takeaway.</b> Early OPD is remarkably regular.
Weak teachers generally induce smaller initial slopes for large students.
Teachers closer to the student's scale raise gold score faster per unit of $d$.
Where gold score regresses late, the teacher's proxy reward keeps rising, which is the signature of implicit-reward overoptimization.
</p></div>

<div class="kicker">Finding 2</div>

## Small experts lift much larger students

In **every** weak-to-strong pair, the student's peak gold score exceeds its teacher's own score.
The margin shrinks as the teacher's size approaches the student's.
For the 7B and 14B students, the peak climbs monotonically with teacher size, from 72.7% to 81.9% and from 77.7% to 87.3%.
But teacher scale helps **only up to about the student's own scale**.
The 0.5B student peaks at 40.8% with a 3B teacher and drops to 37.7% with a 14B teacher.

<div class="viz">
  <div class="viz-bar">
    <span class="lab">Objective</span>
    <div class="seg" data-group="method" role="group" aria-label="OPD objective">
      <button data-value="vanilla_opd" aria-pressed="true">Vanilla</button>
      <button data-value="delta_opd" aria-pressed="false">Delta</button>
    </div>
  </div>
  <div id="chart-peaks" class="plot square"></div>
</div>
<div class="caption" id="fig-peaks">
  <b>Interactive: peak gold score (%) for every teacher–student pair.</b> Cells left of the diagonal are weak-to-strong, the diagonal is same-base, and cells to the right are strong-to-weak.
  Hover over a cell to compare the peak with the teacher's own score and with direct RL on the student.
  Delta-OPD covers 17 of the 25 pairs.
</div>

<div class="takeaway"><p>
<b>Takeaway.</b> A compact RL expert is a cheap source of task skill for a whole model family.
Same-base Vanilla-OPD peaks land within 0.5 points of direct RL at all five scales.
Direct RL on the student is still the ceiling, so weak-to-strong OPD pays off by <i>amortizing</i> one expert, not by beating RL.
</p></div>

<div class="kicker">Finding 3</div>

## Power laws predict the peak before training

We normalize parameter counts by 1B and cap the teacher at the student's scale, $\widetilde N\_T^{\mathrm{eff}} = \min(N\_T, N\_S)/1\mathrm{B}$.
The cap captures the saturation seen above.
Parameter count alone cannot describe an undertrained teacher, so the laws also condition on the effective teacher's remaining error $1 - G\_T^{\mathrm{eff}}$:

$$
1 - G_{\mathrm{peak}} = A\,\widetilde N_S^{-\alpha}\,\big(\widetilde N_T^{\mathrm{eff}}\big)^{-\beta}\,\big(1 - G_T^{\mathrm{eff}}\big)^{\zeta},
\qquad
m = B\,\widetilde N_S^{-\gamma}\,\big(\widetilde N_T^{\mathrm{eff}}\big)^{\delta}\,\big(1 - G_T^{\mathrm{eff}}\big)^{-\xi}.
$$

| Objective   | $A$  | $\alpha$ | $\beta$ | $\zeta$ | $B$  | $\gamma$ | $\delta$ | $\xi$ |
| ----------- | :--: | :------: | :-----: | :-----: | :--: | :------: | :------: | :---: |
| Vanilla-OPD | 0.97 |   0.30   |  −0.27  |  0.95   | 0.12 |   0.19   |  −0.61   | 1.90  |
| Delta-OPD   | 1.02 |   0.34   |  −0.33  |  1.01   | 0.13 |   0.20   |  −0.73   | 2.01  |

<div class="caption">
  <b>Fitted joint power-law coefficients.</b> The left four columns are for peak capability and the right four for useful-transfer rate.
  On the RL-endpoint grid, teacher size and teacher score are almost perfectly collinear.
  Teachers from the bootstrapped chains, which score below the size trend, break that collinearity and identify every exponent.
</div>

Two readings stand out.

- **$\zeta \approx 1$.** Peak student error is nearly proportional to the capped teacher's remaining error, shrunk by a power of student size.
- **$\beta < 0$.** At a matched teacher score, **the smaller teacher transfers better**. A teacher's score alone does not define its value as a supervisor.

Try it yourself.
The presets reproduce the paper's out-of-sample test, in which a 3B teacher checkpoint taken mid-RL is matched in score to the 1.5B RL endpoint.

<div class="viz">
  <div class="calc">
    <div>
      <div class="presets">
        <button data-preset="7,1.5,0.6362">1.5B endpoint → 7B</button>
        <button data-preset="7,3,0.6599">3B mid-RL → 7B</button>
        <button data-preset="14,0.5,0.3983">0.5B expert → 14B</button>
      </div>
      <label for="calc-ns">Student size $N_S$ <b id="calc-ns-v"></b></label>
      <input id="calc-ns" type="range" min="-0.30103" max="1.146128" step="0.001" value="0.845098" />
      <label for="calc-nt">Teacher size $N_T$ <b id="calc-nt-v"></b></label>
      <input id="calc-nt" type="range" min="-0.30103" max="1.146128" step="0.001" value="0.477121" />
      <label for="calc-gt">Effective teacher score $G_T^{\mathrm{eff}}$ <b id="calc-gt-v"></b></label>
      <input id="calc-gt" type="range" min="0.2" max="0.95" step="0.001" value="0.6599" />
      <div style="margin-top:.5rem"><button id="calc-snap" type="button">use RL-endpoint teacher score</button></div>
      <div class="out">
        <div class="stat"><div class="lbl">Vanilla-OPD peak</div><div class="num" id="calc-vanilla_opd-peak"></div><div class="lbl">slope m ≈ <span id="calc-vanilla_opd-rate"></span></div></div>
        <div class="stat"><div class="lbl">Delta-OPD peak</div><div class="num" id="calc-delta_opd-peak"></div><div class="lbl">slope m ≈ <span id="calc-delta_opd-rate"></span></div></div>
      </div>
      <div class="cap" id="calc-cap" hidden>The teacher is larger than the student, so the law caps it at the student's scale. Set the score to that of the capped, student-sized teacher.</div>
    </div>
    <div id="chart-calc" class="plot"></div>
  </div>
</div>
<div class="caption" id="fig-calc">
  <b>Interactive: the joint peak law.</b> Predicted peak gold score and initial slope from Equation 6 of the paper, using the full-precision fitted coefficients.
  The curve sweeps student size for the chosen teacher.
  The fits cover 0.5B to 14B Qwen2.5 models on math, so values outside that range are extrapolations.
</div>

The held-out checkpoint test is the sharpest check of $\beta < 0$.
The 3B mid-RL teacher scores slightly _higher_ than the 1.5B endpoint, yet its 7B student peaks _lower_.
Only the joint law gets the order right:

| Teacher → 7B student      | Teacher score | Observed peak | Scales only | Score only |  Joint   |
| ------------------------- | :-----------: | :-----------: | :---------: | :--------: | :------: |
| 1.5B endpoint (step 580)  |     63.6      |     77.5      |    77.0     |    75.6    | **77.1** |
| 3B intermediate (step 58) |     66.0      |     73.8      |    79.5     |    76.3    | **74.1** |
| 3B endpoint (step 580)    |     73.6      |     80.3      |    79.5     |    78.7    | **79.6** |

<div class="paper-fig narrow">
  {% include figure.liquid path="assets/img/2026-09-30-opd-scaling/teacher_checkpoint.png" class="img-fluid" zoomable=true alt="7B student trajectories under the 1.5B endpoint, 3B intermediate and 3B endpoint teachers" %}
</div>
<div class="caption" id="fig-intermediate">
  <b>Intermediate-teacher validation.</b> Gold score against $d$ for the 7B student distilled from the 1.5B RL endpoint, the score-matched 3B checkpoint at step 58, and the 3B RL endpoint.
  Stars mark peaks, and dashed levels mark each teacher's own gold score.
</div>

How well do the laws fit overall?
The next chart plots every cell's observed value against the law's prediction.
It includes the bootstrapped-teacher cells, which are what make the teacher exponents identifiable.

<div class="viz">
  <div class="viz-bar">
    <span class="lab">Target</span>
    <div class="seg" data-group="target" role="group" aria-label="law target">
      <button data-value="peak" aria-pressed="true">Peak G</button>
      <button data-value="rate" aria-pressed="false">Slope m</button>
    </div>
  </div>
  <div id="chart-parity" class="plot square"></div>
</div>
<div class="caption" id="fig-parity">
  <b>Interactive: observed against predicted.</b> Predictions come from the full-fit joint laws.
  The dotted diagonal is a perfect prediction, and open diamonds mark cells whose teacher is itself an OPD product of a bootstrapped chain.
  The rate fits are noisier, with log-space $R^2$ of 0.59 for Vanilla-OPD and 0.76 for Delta-OPD.
  Read the rate law as an interpretable summary rather than a precise predictor.
</div>

| Objective   | Peak law           | Leave-one-scale-out RMSE ↓ | Extrapolation RMSE, student / teacher ↓ |
| ----------- | ------------------ | :------------------------: | :-------------------------------------: |
| Vanilla-OPD | Scales only        |            3.43            |               0.64 / 0.75               |
|             | Teacher score only |            2.55            |               2.54 / 0.70               |
|             | **Joint**          |          **1.66**          |           **0.55** / **0.68**           |
| Delta-OPD   | Scales only        |            2.47            |             0.21 / **0.29**             |
|             | Teacher score only |            2.07            |               0.93 / 0.46               |
|             | **Joint**          |          **0.82**          |             **0.20** / 0.32             |

<div class="caption">
  <b>Validation of the peak laws, in accuracy points.</b> Leave-one-scale-out RMSE refits each law with every cell sharing one student or teacher scale withheld.
  Extrapolation RMSE withholds the largest student or teacher scale.
</div>

The **transfer extent** does not follow a comparable law.
Observed departures and censored lower bounds span $d$ of 0.20–0.36 for Vanilla-OPD and 0.27–0.34 for Delta-OPD, with medians of 0.30 and 0.29.
It is better read as an approximately **scale-free KL budget**.

<div class="kicker">Finding 4</div>

## Design choices: what helps and what hurts

We vary one design choice at a time.

<div class="design">
  <div class="card">
    <div class="paper-fig">
      {% include figure.liquid path="assets/img/2026-09-30-opd-scaling/delta_comparison.png" class="img-fluid" zoomable=true alt="Peak gold score for Delta-OPD, Vanilla-OPD and direct RL" %}
    </div>
    <h4>Delta-OPD transfers faster ✓</h4>
    <p>Its slope beats Vanilla-OPD in <b>15 of 17</b> shared pairs, and it reaches the higher peak in 12, mostly weak-to-strong pairs. The gain shrinks with teacher size: the 0.5B teacher adds 2–4 points, while larger teachers stay within about one point.</p>
  </div>
  <div class="card">
    <div class="paper-fig">
      {% include figure.liquid path="assets/img/2026-09-30-opd-scaling/onpolicyness.png" class="img-fluid" zoomable=true alt="Peak gold score under three degrees of on-policy supervision" %}
    </div>
    <h4>Stay on-policy ✓</h4>
    <p>Pure OPD wins in every cell. An off-policy SFT cold start costs <b>6.6, 15.7 and 19.4 points</b> for 3B, 7B and 14B students of the 0.5B expert, and pins them near the teacher's own score. Pure OffPD trails by up to 28.4 points.</p>
  </div>
  <div class="card">
    <div class="paper-fig">
      {% include figure.liquid path="assets/img/2026-09-30-opd-scaling/bootstrap.png" class="img-fluid" zoomable=true alt="Bootstrapped 0.5B to 14B chains against direct OPD" %}
    </div>
    <h4>Don't bootstrap ✗</h4>
    <p>Chaining 0.5B→1.5B→3B→7B→14B peaks <b>below</b> direct OPD from the 0.5B expert at every size, for example 76.8 against 77.7 at 14B. The chain's intermediate teachers score higher, yet teach worse.</p>
  </div>
</div>

The bootstrapping result reverses the gains that Burns et al. report for weak-to-strong fine-tuning<d-cite key="burns2024weak"></d-cite>.
It echoes recent OPD findings that a higher-scoring teacher helps only when it offers new capabilities<d-cite key="li2026rethinking"></d-cite>.
A teacher's score and its teaching value can come apart.
For example, the 1.5B OPD product scores 53.0% against the 0.5B RL expert's 39.8%, yet its 3B student peaks lower.

## Takeaways for practitioners

- **Budget KL, not steps.** Useful transfer happens within a roughly scale-free budget of $d \approx 0.3$. Track $\sqrt{\mathrm{KL}}$ and expect the gains to flatten beyond it.
- **Train RL once, small.** A compact RL expert lifts every larger sibling above the expert's own score, so one expert can be amortized across a model family.
- **Match the teacher to the student.** Peak gains saturate once the teacher reaches the student's size. For small students, larger teachers can even hurt.
- **Judge teachers by more than score.** At equal score the smaller teacher transfers better, and bootstrapped teachers with higher scores still teach worse.
- **Skip the cold start.** SFT on a weak teacher's rollouts before OPD can erase most of a strong student's head start.
- **Predict before you train.** The joint law estimates the peak from $N_S$, $N_T$ and $G_T$ to within about a point at held-out scales.

**Scope.** All results come from Qwen2.5 base models on math reasoning, and each curve is a single run.
Parameter count also bundles data and compute, so the laws should be read at the compute-optimal settings of that model family.

## Citation

If you find this work useful, please cite:

```bibtex
@misc{bao2026scaling,
  title         = {Scaling Properties of Same-Family On-Policy Distillation},
  author        = {Bao, Yuntai and Li, Qinfeng and Jiang, Guoqing and Chen, Liwei and
                   Qin, Zhiheng and Li, Xuanping and Zhang, Wenqi and Zhang, Xuhong},
  year          = {2026},
  eprint        = {2609.32722},
  archiveprefix = {arXiv},
  primaryclass  = {cs.LG},
  url           = {https://arxiv.org/abs/2609.32722}
}
```

<script defer src="{{ '/assets/js/2026-09-30-opd-scaling.js' | relative_url | bust_file_cache }}"></script>
