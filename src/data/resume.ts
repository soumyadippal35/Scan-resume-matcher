export const resume = {
  name: "Soumyadip Pal",
  contact: {
    phone: "+91-8759324551",
    location: "Majdia, Nadia, West Bengal",
    email: "soumyadippal35@gmail.com",
    linkedin: "https://linkedin.com/in/soumyadip-pal",
    github: "https://github.com/soumyadippal35",
  },
  summary:
    "Computer Science Engineering student specializing in Data Science, with strong knowledge of Python, SQL, Machine Learning, Artificial Intelligence, and Data Visualization, backed by hands-on, industry-oriented projects. Skilled Prompt Engineer with practical experience in AI-assisted software development. Eager to learn, grow, and contribute effectively in a professional environment.",
  skills: [
    { group: "Programming Languages", items: ["C", "Python"] },
    { group: "Web Technologies", items: ["HTML", "CSS", "JavaScript"] },
    { group: "Data Science & AI", items: ["Machine Learning", "Artificial Intelligence", "Generative AI", "Prompt Engineering"] },
    { group: "Data Visualization", items: ["Power BI"] },
    { group: "Libraries & Tools", items: ["Pandas", "NumPy", "Jupyter Notebook"] },
    { group: "Soft Skills", items: ["Teamwork", "Time Management", "Problem Solving"] },
  ],
  experience: [
    {
      role: "Full Stack Web Development Intern",
      org: "Euphoria GenX",
      period: "2026–Present",
      bullets: ["Developing responsive web applications using HTML, CSS, JavaScript, and backend technologies."],
    },
  ],
  projects: [
    {
      title: "Portfolio Website",
      stack: "Lovable AI, Prompt Engineering",
      bullets: ["Developed a responsive portfolio website using Lovable AI and prompt engineering, reducing development time while creating a multi-page responsive interface."],
    },
    {
      title: "Local Service Marketplace Website",
      stack: "Claude AI, Prompt Engineering",
      bullets: ["Architected a local service marketplace website, leveraging Claude AI to generate, debug, and optimize the entire codebase through advanced prompt engineering."],
    },
    {
      title: "Student Path Finder Web Application",
      stack: "Gemini AI, Prompt Engineering",
      bullets: ["Utilized Gemini AI through targeted prompt engineering to architect a Student Path Finder web application."],
    },
    {
      title: "HR Analytics / Employee Attrition Dashboard",
      stack: "Excel, Power BI, DAX",
      bullets: [
        "Analyzed 1,480 employee records across 37 attributes (department, job role, overtime, job satisfaction, work-life balance, income, tenure, and more) to identify key drivers of employee attrition.",
        "Performed data validation and summary analysis in Excel using formula-driven functions (COUNTIFS, SUMIFS) to clean and structure the dataset.",
        "Built an interactive Power BI dashboard with custom DAX measures for Attrition Rate, headcount, and departmental averages, surfacing where and why the business was losing employees to support HR retention decisions.",
      ],
    },
    {
      title: "SCAN — Resume × JD Match Engine",
      stack: "React, Three.js, Vite, Claude API",
      bullets: ["This site. A resume-to-job-description match engine combining local keyword scoring with an AI semantic assessment, built end-to-end with prompt engineering."],
    },
  ],
  education: [
    { degree: "B.Tech in Computer Science and Engineering (Data Science)", org: "Brainware University, Kolkata", period: "2023–2027" },
    { degree: "Class XII, West Bengal Board", org: "Majdia Rail Bajar High School, Majdia", period: "2023" },
    { degree: "Class X, West Bengal Board", org: "Majdia Rail Bajar High School, Majdia", period: "2021" },
  ],
  achievements: [
    "Secured a place at the Samsung Innovation Campus by architecting an AI-powered movie recommendation system, leveraging prompt engineering through Claude — 2025",
    "West Bengal SVMCM Merit Scholarship — awarded for maintaining high academic performance throughout the curriculum.",
    "Entrepreneurship Foundations for Deep Tech Startups — Turnip Innovations, in association with Qualcomm & L2Pro India (Mar 2026). Scored 100%, demonstrating strong grasp of startup fundamentals and deep-tech venture building.",
  ],
  courses: [
    { title: "Data Structures and Algorithms", org: "Mind Luster 2025", note: "DSA fundamentals." },
    { title: "Database Connectivity and Reporting", org: "Mind Luster 2025", note: "Database and reporting basics." },
    { title: "Artificial Intelligence Tools", org: "Mind Luster 2025", note: "AI tools fundamentals." },
    { title: "ADCA (Advanced Diploma in Computer Applications)", org: "2023", note: "Computer applications." },
    { title: "Python Programming Language", org: "MindLuster 2025", note: "12-hour certified course covering Python fundamentals, syntax, and core programming concepts." },
    { title: "Trading Algorithms with Python", org: "MindLuster 2025", note: "Designing and implementing algorithmic trading strategies using Python." },
    { title: "Soft Skills", org: "MindLuster 2025", note: "Essential workplace and communication skills to complement technical expertise." },
  ],
  languages: [
    { name: "English", level: "Intermediate" },
    { name: "Hindi", level: "Intermediate" },
    { name: "Bengali", level: "Native" },
  ],
};

export type Resume = typeof resume;
