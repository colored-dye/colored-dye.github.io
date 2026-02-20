// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-publications",
          title: "publications",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "post-concept-distributed-alignment-search-for-faithful-representation-steering",
        
          title: "Concept Distributed Alignment Search for Faithful Representation Steering",
        
        description: "discussions regarding our recent work on faithful representation steering.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/concept-das/";
          
        },
      },{id: "post-standup-and-xiangsheng",
        
          title: "Standup and Xiangsheng",
        
        description: "something off the top of my head.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/standup-xiangsheng/";
          
        },
      },{id: "post-happy-chinese-new-year",
        
          title: "Happy Chinese New Year",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/happy-chinese-new-year/";
          
        },
      },{id: "post-随笔",
        
          title: "随笔",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/scribbles/";
          
        },
      },{id: "post-随笔",
        
          title: "随笔",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/scribbles/";
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-a-simple-inline-announcement",
          title: 'A simple inline announcement.',
          description: "",
          section: "News",},{id: "teachings-introduction-to-machine-learning",
          title: 'Introduction to Machine Learning',
          description: "This course provides an introduction to machine learning concepts, algorithms, and applications. Students will learn about supervised and unsupervised learning, model evaluation, and practical implementations.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/introduction-to-machine-learning/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%62%61%6F%79%75%6E%74%61%69@%6F%75%74%6C%6F%6F%6B.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=phKr8uQAAAAJ", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/colored-dye", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
