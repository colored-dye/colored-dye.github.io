/* Interactive figures for the post "Scaling Properties of Same-Family On-Policy Distillation".
 * Data lives in assets/json/2026-09-30-opd-scaling/ and is exported from the paper's analysis CSVs.
 * Charts re-render when the site theme toggles (html[data-theme]).
 */
(function () {
  "use strict";

  const SCALES = [0.5, 1.5, 3, 7, 14];
  const fmtB = (b) => `${b}B`;
  const pct = (v, k = 1) => (100 * v).toFixed(k);

  // Ordinal blue ramp for teacher scale (small -> large teacher = light -> dark in light mode).
  const RAMP = {
    light: ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab", "#104281"],
    dark: ["#1c5cab", "#2a78d6", "#5598e7", "#86b6ef", "#cde2fb"],
  };
  const SEQ = {
    light: [
      [0, "#cde2fb"],
      [0.5, "#5598e7"],
      [1, "#104281"],
    ],
    dark: [
      [0, "#184f95"],
      [0.5, "#3987e5"],
      [1, "#cde2fb"],
    ],
  };
  const METHOD_COLOR = {
    light: { vanilla_opd: "#2a78d6", delta_opd: "#eb6834" },
    dark: { vanilla_opd: "#3987e5", delta_opd: "#d95926" },
  };
  const METHOD_NAME = { vanilla_opd: "Vanilla-OPD", delta_opd: "Delta-OPD" };

  function theme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function tokens() {
    const cs = getComputedStyle(document.documentElement);
    const v = (n, fb) => (cs.getPropertyValue(n) || "").trim() || fb;
    return {
      text: v("--global-text-color", "#000"),
      muted: v("--global-text-color-light", "#828282"),
      grid: v("--global-divider-color", "rgba(0,0,0,.1)"),
      bg: v("--global-bg-color", "#fff"),
      accent: v("--global-theme-color", "#b509ac"),
    };
  }

  function baseLayout(t, extra) {
    const axis = {
      gridcolor: t.grid,
      linecolor: t.grid,
      zerolinecolor: t.grid,
      tickfont: { color: t.muted, size: 12 },
      title: { font: { color: t.muted, size: 13 } },
      automargin: true,
    };
    return Object.assign(
      {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: { family: "inherit", color: t.text, size: 13 },
        margin: { l: 56, r: 16, t: 16, b: 48 },
        hovermode: "closest",
        hoverlabel: { bgcolor: t.bg, bordercolor: t.grid, font: { color: t.text, size: 12 } },
        legend: { font: { color: t.text, size: 12 }, bgcolor: "rgba(0,0,0,0)" },
        xaxis: Object.assign({}, axis),
        yaxis: Object.assign({}, axis),
      },
      extra || {}
    );
  }

  const CONFIG = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ["select2d", "lasso2d", "autoScale2d"] };

  function mergeAxis(layout, key, obj) {
    layout[key] = Object.assign({}, layout[key], obj);
    if (obj.title && typeof obj.title === "string") {
      layout[key].title = { text: obj.title, font: { color: tokens().muted, size: 13 } };
    }
  }

  // Segmented control helper: <div class="seg" data-group="x"><button data-value="..">
  function bindSeg(root, onChange) {
    root.querySelectorAll("button").forEach((btn) =>
      btn.addEventListener("click", () => {
        root.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
        onChange(btn.dataset.value);
      })
    );
  }

  /* ------------------------------------------------------------------ Chart A: trajectories */
  function trajectoryChart(el, data, peaks) {
    const state = { student: "7", method: "vanilla_opd" };
    const wrap = el.closest(".viz");
    bindSeg(wrap.querySelector('[data-group="student"]'), (v) => {
      state.student = v;
      draw();
    });
    bindSeg(wrap.querySelector('[data-group="method"]'), (v) => {
      state.method = v;
      draw();
    });
    const note = wrap.querySelector(".viz-note");
    const playBtn = wrap.querySelector(".play");
    const readout = wrap.querySelector(".step-readout");

    // ---- training replay: one dot per run, all advancing one update per tick
    const LOOP_MS = 7000;
    const HOLD_MS = 1200;
    const FRAME_MS = 33;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const anim = { runs: [], dotIdx: [], maxStep: 0, step: 0, userPaused: reduced, hover: false, visible: false, hold: 0, last: 0, raf: 0 };

    function setPlayLabel() {
      if (!playBtn) return;
      playBtn.setAttribute("aria-pressed", anim.userPaused ? "false" : "true");
      playBtn.textContent = anim.userPaused ? "▶ Replay" : "❚❚ Pause";
    }
    function dotPos(r, step) {
      const i = Math.min(Math.floor(step), r.d.length - 1);
      return [r.d[i], 100 * r.g[i], i >= r.d.length - 1];
    }
    function renderDots() {
      if (!anim.dotIdx.length) return;
      const pos = anim.runs.map((r) => dotPos(r, anim.step));
      Plotly.restyle(
        el,
        { x: pos.map((p) => [p[0]]), y: pos.map((p) => [p[1]]), "marker.opacity": pos.map((p) => (p[2] && anim.step > 0 ? 0.5 : 1)) },
        anim.dotIdx
      );
      if (readout) readout.textContent = `update ${Math.floor(anim.step)} / ${anim.maxStep}`;
    }
    function running() {
      return !anim.userPaused && !anim.hover && anim.visible && !document.hidden;
    }
    function tick(now) {
      anim.raf = 0;
      if (!running()) return;
      const dt = anim.last ? Math.min(now - anim.last, 100) : 0;
      if (dt >= FRAME_MS || !anim.last) {
        anim.last = now;
        if (anim.step >= anim.maxStep) {
          anim.hold += dt;
          if (anim.hold >= HOLD_MS) {
            anim.hold = 0;
            anim.step = 0;
          }
        } else {
          anim.step = Math.min(anim.maxStep, anim.step + (dt * anim.maxStep) / LOOP_MS);
        }
        renderDots();
      }
      anim.raf = requestAnimationFrame(tick);
    }
    function kick() {
      if (!anim.raf && running()) {
        anim.last = 0;
        anim.raf = requestAnimationFrame(tick);
      }
    }
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        anim.userPaused = !anim.userPaused;
        if (!anim.userPaused && anim.step >= anim.maxStep) anim.step = 0;
        setPlayLabel();
        kick();
      });
    }
    setPlayLabel();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => {
        anim.visible = es[0].isIntersecting;
        kick();
      }).observe(el);
    } else {
      anim.visible = true;
    }
    document.addEventListener("visibilitychange", kick);
    let hoverBound = false;

    function draw() {
      const t = tokens();
      const th = theme();
      const traces = [];
      const shown = [];
      const colors = [];
      SCALES.forEach((tb, i) => {
        const key = `${state.student}<-${tb}`;
        const r = data[state.method][key];
        if (!r) return;
        shown.push(r);
        const color = RAMP[th][i];
        colors.push(color);
        const gT = peaks.teacher_score[String(tb)];
        const name = `${fmtB(tb)} teacher`;
        traces.push({
          x: r.d,
          y: r.g.map((g) => 100 * g),
          type: "scatter",
          mode: "lines",
          name,
          legendgroup: name,
          line: { color, width: 2 },
          hovertemplate: `<b>${name}</b> (G<sub>T</sub>=${pct(gT)}%)<br>d=%{x:.3f}<br>G=%{y:.1f}%<extra></extra>`,
        });
        const x1 = r.d_transfer;
        traces.push({
          x: [0, x1],
          y: [100 * r.c, 100 * (r.c + r.m * x1)],
          mode: "lines",
          legendgroup: name,
          showlegend: false,
          line: { color: t.text, width: 1.25, dash: "dash" },
          opacity: 0.7,
          hovertemplate: `<b>${name}</b> linear fit<br>G = ${pct(r.c)} + ${(100 * r.m).toFixed(1)}·d<br>R² = ${r.r2.toFixed(3)}<extra></extra>`,
        });
        traces.push({
          x: [r.peak[0]],
          y: [100 * r.peak[1]],
          mode: "markers",
          legendgroup: name,
          showlegend: false,
          marker: { symbol: "star", size: 14, color, line: { color: t.bg, width: 1.5 } },
          hovertemplate: `<b>${name}</b> peak<br>G<sub>peak</sub>=${pct(r.peak[1])}% at d=${r.peak[0].toFixed(3)}<extra></extra>`,
        });
        if (!r.censored) {
          traces.push({
            x: [x1],
            y: [100 * (r.c + r.m * x1)],
            mode: "markers",
            legendgroup: name,
            showlegend: false,
            marker: { symbol: "line-ns", size: 14, line: { color: t.text, width: 2 } },
            hovertemplate: `<b>${name}</b><br>transfer endpoint d<sub>transfer</sub>=${x1.toFixed(3)}<extra></extra>`,
          });
        }
      });
      // replay dots go last so they sit above fits and stars
      anim.runs = shown;
      anim.maxStep = Math.max(0, ...shown.map((r) => r.d.length - 1));
      anim.step = reduced && anim.userPaused ? anim.maxStep : Math.min(anim.step, anim.maxStep);
      anim.dotIdx = [];
      shown.forEach((r, j) => {
        const p = dotPos(r, anim.step);
        anim.dotIdx.push(traces.length);
        traces.push({
          x: [p[0]],
          y: [p[1]],
          mode: "markers",
          showlegend: false,
          hoverinfo: "skip",
          marker: { size: 11, color: colors[j], opacity: 1, line: { color: t.bg, width: 2 } },
        });
      });
      const rl = peaks.teacher_score[state.student];
      const layout = baseLayout(t, {
        legend: { orientation: "h", y: 1.1, x: 0, font: { color: t.text, size: 12 } },
        margin: { l: 56, r: 16, t: 40, b: 48 },
        shapes: [
          {
            type: "line",
            xref: "paper",
            x0: 0,
            x1: 1,
            y0: 100 * rl,
            y1: 100 * rl,
            line: { color: t.muted, width: 1, dash: "dot" },
          },
        ],
        annotations: [
          {
            xref: "paper",
            x: 1,
            y: 100 * rl,
            xanchor: "right",
            yanchor: "bottom",
            text: `direct RL on ${state.student}B student: ${pct(rl)}%`,
            showarrow: false,
            font: { color: t.muted, size: 11 },
          },
        ],
      });
      mergeAxis(layout, "xaxis", { title: "d = √KL(π<sub>θ</sub> ‖ π<sub>ref</sub>)  (token-mean)", rangemode: "tozero" });
      mergeAxis(layout, "yaxis", { title: "gold score G (%)", ticksuffix: "" });
      Plotly.react(el, traces, layout, CONFIG);
      if (readout) readout.textContent = `update ${Math.floor(anim.step)} / ${anim.maxStep}`;
      if (!hoverBound && el.on) {
        hoverBound = true;
        el.on("plotly_hover", () => {
          anim.hover = true;
        });
        el.on("plotly_unhover", () => {
          anim.hover = false;
          kick();
        });
      }
      kick();
      if (note) {
        const r2 = shown.map((r) => r.r2);
        note.textContent = shown.length
          ? `${shown.length} runs · linear-fit R² ${Math.min(...r2).toFixed(3)}–${Math.max(...r2).toFixed(3)} over the first ${shown[0].n_fit} checkpoints`
          : "";
      }
    }
    return draw;
  }

  /* ------------------------------------------------------------------ Chart B: peak heatmap */
  function heatmapChart(el, peaks) {
    const state = { method: "vanilla_opd" };
    const wrap = el.closest(".viz");
    bindSeg(wrap.querySelector('[data-group="method"]'), (v) => {
      state.method = v;
      draw();
    });

    function draw() {
      const t = tokens();
      const th = theme();
      const z = [];
      const text = [];
      const custom = [];
      SCALES.forEach((s) => {
        const zr = [];
        const tr = [];
        const cr = [];
        SCALES.forEach((tb) => {
          const v = peaks[state.method][`${s}<-${tb}`];
          const gT = peaks.teacher_score[String(tb)];
          const rl = peaks.teacher_score[String(s)];
          zr.push(v === undefined ? null : 100 * v);
          tr.push(v === undefined ? "" : pct(v));
          const rel = tb < s ? "weak-to-strong" : tb === s ? "same-base" : "strong-to-weak";
          cr.push([rel, pct(gT), v === undefined ? "–" : (100 * (v - gT)).toFixed(1), pct(rl), v === undefined ? "–" : (100 * (v - rl)).toFixed(1)]);
        });
        z.push(zr);
        text.push(tr);
        custom.push(cr);
      });
      const labels = SCALES.map(fmtB);
      const trace = {
        type: "heatmap",
        x: labels,
        y: labels,
        z,
        text,
        customdata: custom,
        texttemplate: "%{text}",
        textfont: { size: 13 },
        colorscale: SEQ[th],
        zmin: 35,
        zmax: 90,
        xgap: 3,
        ygap: 3,
        hoverongaps: false,
        colorbar: {
          title: { text: "peak G (%)", font: { color: t.muted, size: 12 } },
          tickfont: { color: t.muted },
          outlinewidth: 0,
          thickness: 10,
        },
        hovertemplate:
          "<b>%{y} student ← %{x} teacher</b> (%{customdata[0]})<br>" +
          "peak G: %{text}%<br>teacher's own G<sub>T</sub>: %{customdata[1]}% (Δ %{customdata[2]} pts)<br>" +
          "direct RL on student: %{customdata[3]}% (Δ %{customdata[4]} pts)<extra></extra>",
      };
      const layout = baseLayout(t, {
        margin: { l: 64, r: 8, t: 8, b: 56 },
        plot_bgcolor: "rgba(0,0,0,0)",
      });
      mergeAxis(layout, "xaxis", { title: "teacher size N<sub>T</sub>", type: "category", showgrid: false });
      mergeAxis(layout, "yaxis", { title: "student size N<sub>S</sub>", type: "category", showgrid: false });
      Plotly.react(el, [trace], layout, CONFIG);
    }
    return draw;
  }

  /* ------------------------------------------------------------------ Chart C: calculator */
  function peakLaw(c, s, tb, g) {
    return 1 - c.A * Math.pow(s, -c.alpha) * Math.pow(Math.min(tb, s), -c.beta) * Math.pow(1 - g, c.zeta);
  }
  function rateLaw(c, s, tb, g) {
    return c.B * Math.pow(s, -c.gamma) * Math.pow(Math.min(tb, s), c.delta) * Math.pow(1 - g, -c.xi);
  }

  function calculator(el, law, peaks) {
    const wrap = el.closest(".viz");
    const inS = wrap.querySelector("#calc-ns");
    const inT = wrap.querySelector("#calc-nt");
    const inG = wrap.querySelector("#calc-gt");
    const out = (id) => wrap.querySelector(id);
    // sliders store log10(size) for size inputs
    const toSize = (x) => Math.pow(10, parseFloat(x));
    const niceSize = (b) => (b < 1 ? b.toFixed(2) : b < 10 ? b.toFixed(1) : b.toFixed(0));

    function set(s, tb, g) {
      inS.value = Math.log10(s);
      inT.value = Math.log10(tb);
      inG.value = g;
      draw();
    }
    wrap.querySelectorAll("[data-preset]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const [s, tb, g] = btn.dataset.preset.split(",").map(Number);
        set(s, tb, g);
      })
    );
    wrap.querySelector("#calc-snap").addEventListener("click", () => {
      const tb = toSize(inT.value);
      const nearest = SCALES.reduce((a, b) => (Math.abs(Math.log(b / tb)) < Math.abs(Math.log(a / tb)) ? b : a));
      const s = toSize(inS.value);
      const eff = SCALES.reduce((a, b) => (Math.abs(Math.log(b / Math.min(nearest, s))) < Math.abs(Math.log(a / Math.min(nearest, s))) ? b : a));
      inT.value = Math.log10(nearest);
      inG.value = peaks.teacher_score[String(eff)];
      draw();
    });
    [inS, inT, inG].forEach((i) => i.addEventListener("input", () => draw()));

    function draw() {
      const t = tokens();
      const th = theme();
      const s = toSize(inS.value);
      const tb = toSize(inT.value);
      const g = parseFloat(inG.value);
      out("#calc-ns-v").textContent = `${niceSize(s)}B`;
      out("#calc-nt-v").textContent = `${niceSize(tb)}B`;
      out("#calc-gt-v").textContent = `${pct(g)}%`;
      ["vanilla_opd", "delta_opd"].forEach((m) => {
        const c = law.coef[m];
        out(`#calc-${m}-peak`).textContent = `${pct(peakLaw(c, s, tb, g))}%`;
        out(`#calc-${m}-rate`).textContent = rateLaw(c, s, tb, g).toFixed(2);
      });
      out("#calc-cap").hidden = !(tb > s);

      // curve over student size for the chosen teacher
      const xs = [];
      for (let i = 0; i <= 80; i++) xs.push(Math.pow(10, Math.log10(0.5) + (i / 80) * (Math.log10(14) - Math.log10(0.5))));
      const traces = ["vanilla_opd", "delta_opd"].map((m) => ({
        x: xs,
        y: xs.map((x) => 100 * peakLaw(law.coef[m], x, tb, g)),
        mode: "lines",
        name: METHOD_NAME[m],
        line: { color: METHOD_COLOR[th][m], width: 2, dash: m === "delta_opd" ? "dash" : "solid" },
        hovertemplate: `${METHOD_NAME[m]}<br>N<sub>S</sub>=%{x:.2f}B → predicted G<sub>peak</sub>=%{y:.1f}%<extra></extra>`,
      }));
      ["vanilla_opd", "delta_opd"].forEach((m) =>
        traces.push({
          x: [s],
          y: [100 * peakLaw(law.coef[m], s, tb, g)],
          mode: "markers",
          showlegend: false,
          marker: { size: 11, color: METHOD_COLOR[th][m], symbol: m === "delta_opd" ? "square" : "circle", line: { color: t.bg, width: 2 } },
          hoverinfo: "skip",
        })
      );
      const layout = baseLayout(t, {
        legend: { orientation: "h", y: 1.12, x: 0, font: { color: t.text, size: 12 } },
        margin: { l: 56, r: 12, t: 32, b: 48 },
        shapes: [
          {
            type: "line",
            x0: tb,
            x1: tb,
            yref: "paper",
            y0: 0,
            y1: 1,
            line: { color: t.muted, width: 1, dash: "dot" },
          },
        ],
        annotations: [
          {
            x: Math.log10(tb),
            yref: "paper",
            y: 0,
            yanchor: "bottom",
            xanchor: "left",
            text: " teacher size",
            showarrow: false,
            font: { color: t.muted, size: 11 },
          },
        ],
      });
      mergeAxis(layout, "xaxis", {
        title: "student size N<sub>S</sub> (log)",
        type: "log",
        tickvals: SCALES,
        ticktext: SCALES.map(fmtB),
      });
      mergeAxis(layout, "yaxis", { title: "predicted peak G (%)" });
      Plotly.react(el, traces, layout, CONFIG);
    }
    return draw;
  }

  /* ------------------------------------------------------------------ Chart D: observed vs predicted */
  function parityChart(el, law) {
    const state = { target: "peak" };
    const wrap = el.closest(".viz");
    bindSeg(wrap.querySelector('[data-group="target"]'), (v) => {
      state.target = v;
      draw();
    });

    function draw() {
      const t = tokens();
      const th = theme();
      const isPeak = state.target === "peak";
      const scale = isPeak ? 100 : 1;
      const traces = [];
      let lo = Infinity;
      let hi = -Infinity;
      ["vanilla_opd", "delta_opd"].forEach((m) => {
        [false, true].forEach((aux) => {
          const cells = law.cells.filter((c) => c.method === m && c.aux === aux);
          const x = cells.map((c) => scale * (isPeak ? c.peak_pred : c.m_pred));
          const y = cells.map((c) => scale * (isPeak ? c.peak : c.m));
          x.concat(y).forEach((v) => {
            lo = Math.min(lo, v);
            hi = Math.max(hi, v);
          });
          traces.push({
            x,
            y,
            mode: "markers",
            name: aux ? `${METHOD_NAME[m]} · bootstrapped teacher` : METHOD_NAME[m],
            marker: {
              size: aux ? 11 : 9,
              symbol: aux ? "diamond-open" : m === "delta_opd" ? "square" : "circle",
              color: METHOD_COLOR[th][m],
              line: { color: aux ? METHOD_COLOR[th][m] : t.bg, width: aux ? 2 : 1.5 },
            },
            text: cells.map((c) => (aux ? `${c.pair} (teacher G<sub>T</sub>=${pct(c.gt)}%)` : `${c.s}B student ← ${c.t}B teacher`)),
            hovertemplate: isPeak
              ? "<b>%{text}</b><br>observed %{y:.1f}% · predicted %{x:.1f}%<extra></extra>"
              : "<b>%{text}</b><br>observed m=%{y:.3f} · predicted %{x:.3f}<extra></extra>",
          });
        });
      });
      const pad = (hi - lo) * 0.05;
      const layout = baseLayout(t, {
        legend: { orientation: "h", y: -0.22, x: 0, font: { color: t.text, size: 12 } },
        margin: { l: 56, r: 12, t: 12, b: 56 },
        shapes: [
          {
            type: "line",
            x0: lo - pad,
            y0: lo - pad,
            x1: hi + pad,
            y1: hi + pad,
            line: { color: t.muted, width: 1, dash: "dot" },
          },
        ],
      });
      mergeAxis(layout, "xaxis", { title: isPeak ? "predicted peak G (%)" : "predicted slope m", range: [lo - pad, hi + pad] });
      mergeAxis(layout, "yaxis", { title: isPeak ? "observed peak G (%)" : "observed slope m", range: [lo - pad, hi + pad] });
      Plotly.react(el, traces, layout, CONFIG);
    }
    return draw;
  }

  /* ------------------------------------------------------------------ boot */
  function init() {
    const root = document.getElementById("opd-viz-data");
    if (!root || typeof Plotly === "undefined") return;
    const base = root.dataset.base;
    const get = (f) => fetch(base + f).then((r) => r.json());
    Promise.all([get("trajectories.json"), get("peaks.json"), get("law.json")]).then(([traj, peaks, law]) => {
      const charts = [
        ["chart-traj", (el) => trajectoryChart(el, traj, peaks)],
        ["chart-peaks", (el) => heatmapChart(el, peaks)],
        ["chart-calc", (el) => calculator(el, law, peaks)],
        ["chart-parity", (el) => parityChart(el, law)],
      ];
      const draws = [];
      const io =
        "IntersectionObserver" in window
          ? new IntersectionObserver(
              (entries) =>
                entries.forEach((e) => {
                  if (!e.isIntersecting) return;
                  io.unobserve(e.target);
                  const d = e.target._factory(e.target);
                  draws.push(d);
                  d();
                }),
              { rootMargin: "300px" }
            )
          : null;
      charts.forEach(([id, factory]) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (io) {
          el._factory = factory;
          io.observe(el);
        } else {
          const d = factory(el);
          draws.push(d);
          d();
        }
      });
      new MutationObserver(() => draws.forEach((d) => d())).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    });
  }

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init);
})();
