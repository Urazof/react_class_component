import './AboutPage.css';

function AboutPage() {
  return (
    <div className="about-page">
      <h2 className="about-page__title">About</h2>
      <p className="about-page__author">
        Built by <strong>Sergeyu</strong>
      </p>
      <p className="about-page__description">
        A Rick &amp; Morty character explorer built with React, TypeScript, and
        React Router.
      </p>
      <a
        className="about-page__link"
        href="https://rs.school/courses/reactjs"
        target="_blank"
        rel="noopener noreferrer"
      >
        RS School React Course
      </a>
    </div>
  );
}

export default AboutPage;
