---
layout: page
title: personal
permalink: /personal/
nav: true
collection: personal
---

something intimate and non-technical.

<div class="post">

  <ul class="post-list">

  {% assign postlist = site.personal | sort: 'date' | reverse %}

  {% for post in postlist %}

  {% if post.external_source == blank %}
    {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
  {% else %}
    {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
  {% endif %}
  {% assign year = post.date | date: "%Y" %}
  {% assign tags = post.tags | join: "" %}
  {% assign categories = post.categories | join: "" %}

  <li>
    <h3>
    {% if post.redirect == blank %}
      <a class="post-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
    {% elsif post.redirect contains '://' %}
      <a class="post-title" href="{{ post.redirect }}" target="_blank">{{ post.title }}</a>
      <svg width="2rem" height="2rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    {% else %}
      <a class="post-title" href="{{ post.redirect | relative_url }}">{{ post.title }}</a>
    {% endif %}
    </h3>
    <p>{{ post.description }}</p>
    <p class="post-meta">
      {{ read_time }} min read &nbsp; &middot; &nbsp;
      {{ post.date | date: '%B %d, %Y' }}
      {% if post.external_source %}
      &nbsp; &middot; &nbsp; {{ post.external_source }}
      {% endif %}
    </p>
    <p class="post-tags">
      <a href="{{ year | prepend: '/personal/' | relative_url }}">
        <i class="fa-solid fa-calendar fa-sm"></i> {{ year }} </a>
      </p>

  </li>
  {% endfor %}
  </ul>
</div>
