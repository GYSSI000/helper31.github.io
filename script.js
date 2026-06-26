// Typewriter effect
const phrases = [
    "Full-stack разработчик",
    "Web & Python Developer",
    "Создаю цифровые продукты"
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typewriterElement = document.getElementById('typewriter');
const cursor = document.createElement('span');
cursor.className = 'cursor';

function typeEffect() {
    const currentPhrase = phrases[phraseIndex];
    typewriterElement.textContent = currentPhrase.substring(0, charIndex);
    typewriterElement.appendChild(cursor);

    if (!isDeleting && charIndex < currentPhrase.length) {
        charIndex++;
        setTimeout(typeEffect, 100);
    } else if (isDeleting && charIndex > 0) {
        charIndex--;
        setTimeout(typeEffect, 50);
    } else {
        isDeleting = !isDeleting;
        if (!isDeleting) {
            phraseIndex = (phraseIndex + 1) % phrases.length;
        }
        setTimeout(typeEffect, 1500);
    }
}

typeEffect();

// Copy to clipboard
function copyContact(element, text) {
    navigator.clipboard.writeText(text).then(() => {
        const hint = element.querySelector('.copy-hint');
        const originalText = hint.textContent;
        hint.textContent = 'Скопировано!';
        hint.classList.add('copied');
        setTimeout(() => {
            hint.textContent = originalText;
            hint.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    });
}

// Intersection observer for entrance animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -20px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-item').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(15px)';
    item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
    observer.observe(item);
});


// GitHub projects auto loader
// Если твой GitHub-аккаунт другой — поменяй Helper31 на свой логин.
const GITHUB_USERNAME = 'Helper31';
let githubRepos = [];
let activeProjectFilter = 'all';

function escapeHTML(value = '') {
    return String(value).replace(/[&<>'"]/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[char]));
}

async function loadGithubProjects() {
    const container = document.getElementById('github-projects');
    if (!container) return;

    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=12`);

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const repos = await response.json();
        githubRepos = repos
            .filter((repo) => !repo.fork)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        renderProjects(activeProjectFilter);
    } catch (error) {
        container.innerHTML = `
            <div class="project-error">
                Не получилось загрузить проекты автоматически.<br>
                <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" rel="noopener">Открыть GitHub вручную</a>
            </div>
        `;
        console.error(error);
    }
}

function renderProjects(filter = 'all') {
    activeProjectFilter = filter;

    document.querySelectorAll('.filter-btn').forEach((button) => {
        button.classList.toggle('active', button.dataset.filter === filter);
    });

    const container = document.getElementById('github-projects');
    if (!container) return;

    if (!githubRepos.length) {
        container.innerHTML = `
            <div class="project-empty">
                Публичные репозитории пока не найдены.<br>
                <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" rel="noopener">Перейти на GitHub</a>
            </div>
        `;
        return;
    }

    const filteredRepos = filter === 'all'
        ? githubRepos
        : githubRepos.filter((repo) => repo.language === filter);

    if (!filteredRepos.length) {
        container.innerHTML = `
            <div class="project-empty">
                Пока нет публичных проектов на ${escapeHTML(filter)}.<br>
                <a href="https://github.com/${GITHUB_USERNAME}?tab=repositories" target="_blank" rel="noopener">Посмотреть все репозитории</a>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredRepos.map((repo) => {
        const description = repo.description || 'Описание проекта пока не добавлено.';
        const language = repo.language || 'Проект';
        const updatedAt = new Date(repo.updated_at).toLocaleDateString('ru-RU');
        const demoLink = repo.homepage
            ? `<a class="project-link" href="${escapeHTML(repo.homepage)}" target="_blank" rel="noopener">Демо</a>`
            : '';

        return `
            <article class="project-card">
                <h3 class="project-name">${escapeHTML(repo.name)}</h3>
                <p class="project-description">${escapeHTML(description)}</p>
                <div class="project-meta">
                    <span class="project-tag">${escapeHTML(language)}</span>
                    <span class="project-tag">★ ${repo.stargazers_count}</span>
                    <span class="project-tag">Обновлено ${updatedAt}</span>
                </div>
                <div class="project-links">
                    <a class="project-link" href="${escapeHTML(repo.html_url)}" target="_blank" rel="noopener">GitHub →</a>
                    ${demoLink}
                </div>
            </article>
        `;
    }).join('');
}

function showPythonProjects() {
    activeProjectFilter = 'Python';
    const projectsSection = document.getElementById('projects');

    if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (githubRepos.length) {
        renderProjects('Python');
    }
}

loadGithubProjects();
