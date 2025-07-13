// DOM 요소들
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#nav-menu');
const favoritesBtn = document.querySelector('#favorites-btn');
const favoritesModal = document.querySelector('#favorites-modal');
const closeModal = document.querySelector('#close-modal');
const favoritesList = document.querySelector('#favorites-list');
const contactForm = document.querySelector('#contact-form');
const languageDropdown = document.querySelector('.language-dropdown');

// 연구 분야 데이터
const researchData = {
    'tank-analysis': '전차 시뮬레이션 데이터 분석',
    'air-simulation': '항공 시뮬레이션 전략',
    'war-thunder-guide': '워썬더 공략',
    'game-tips': '게임 팁',
    'data-analysis': '전략 연구',
    'meta-analysis': '메타 분석'
};

// 로컬 스토리지 키
const STORAGE_KEYS = {
    FAVORITES: 'war_thunder_favorites',
    CONTACT_DRAFT: 'war_thunder_contact_draft'
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadContactDraft();
    updateInterestButtons();
    initializeAnimations();
});

// 앱 초기화
function initializeApp() {
    // 모바일 네비게이션 토글
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // 즐겨찾기 모달
    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadFavorites();
            favoritesModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }
    
    // 언어 선택 드롭다운
    if (languageDropdown) {
        const languageBtn = languageDropdown.querySelector('#language-btn');
        languageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.innerWidth <= 768) {
                languageDropdown.classList.toggle('active');
            }
        });
    }
    
    // 모달 외부 클릭 시 닫기
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            favoritesModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // 문의 양식 제출
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
        
        // 문의 양식 자동 저장
        const formInputs = contactForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', saveContactDraft);
        });
    }
    
    // 스크롤 시 헤더 스타일 변경
    window.addEventListener('scroll', handleScroll);
    
    // 네비게이션 링크 스무스 스크롤
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                scrollToSection(targetId);
            }
        });
    });
}

// 스크롤 처리
function handleScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(44, 62, 80, 0.98)';
    } else {
        header.style.backgroundColor = 'rgba(44, 62, 80, 0.95)';
    }
}

// 섹션으로 스크롤 이동
function scrollToSection(sectionId) {
    const targetSection = document.querySelector(sectionId);
    if (targetSection) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // 모바일 메뉴 닫기
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    }
}

// 관심 등록/해제 토글
function toggleInterest(researchId) {
    const favorites = getFavorites();
    const button = document.querySelector(`[data-id="${researchId}"] .interest-btn`);
    
    if (favorites.includes(researchId)) {
        // 관심 해제
        const index = favorites.indexOf(researchId);
        favorites.splice(index, 1);
        button.textContent = '관심 등록';
        button.classList.remove('registered');
        showNotification('관심이 해제되었습니다.', 'info');
    } else {
        // 관심 등록
        favorites.push(researchId);
        button.textContent = '등록됨';
        button.classList.add('registered');
        showNotification('관심이 등록되었습니다!', 'success');
    }
    
    saveFavorites(favorites);
}

// 즐겨찾기 가져오기
function getFavorites() {
    const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return favorites ? JSON.parse(favorites) : [];
}

// 즐겨찾기 저장
function saveFavorites(favorites) {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
}

// 관심 버튼 상태 업데이트
function updateInterestButtons() {
    const favorites = getFavorites();
    
    favorites.forEach(researchId => {
        const button = document.querySelector(`[data-id="${researchId}"] .interest-btn`);
        if (button) {
            button.textContent = '등록됨';
            button.classList.add('registered');
        }
    });
}

// 즐겨찾기 모달 열기
function openFavoritesModal() {
    const favorites = getFavorites();
    displayFavorites(favorites);
    favoritesModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 즐겨찾기 모달 닫기
function closeFavoritesModal() {
    favoritesModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 즐겨찾기 목록 표시
function displayFavorites(favorites) {
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p style="text-align: center; color: var(--secondary-color);">등록된 관심 항목이 없습니다.</p>';
        return;
    }
    
    favoritesList.innerHTML = favorites.map(researchId => {
        const researchName = researchData[researchId];
        return `
            <div class="favorite-item">
                <span class="favorite-name">${researchName}</span>
                <button class="remove-favorite" onclick="removeFavorite('${researchId}')">삭제</button>
            </div>
        `;
    }).join('');
}

// 즐겨찾기에서 삭제
function removeFavorite(researchId) {
    const favorites = getFavorites();
    const index = favorites.indexOf(researchId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        saveFavorites(favorites);
        displayFavorites(favorites);
        updateInterestButtons();
        showNotification('즐겨찾기에서 삭제되었습니다.', 'info');
    }
}

// 문의 양식 제출 처리
function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
        timestamp: new Date().toISOString()
    };
    
    // 콘솔에 출력 (실제로는 서버로 전송)
    console.log('문의 데이터:', contactData);
    
    // 성공 메시지 표시
    showNotification('문의가 성공적으로 제출되었습니다!', 'success');
    
    // 폼 초기화
    contactForm.reset();
    clearContactDraft();
}

// 문의 양식 자동 저장
function saveContactDraft() {
    const formData = new FormData(contactForm);
    const draft = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };
    
    localStorage.setItem(STORAGE_KEYS.CONTACT_DRAFT, JSON.stringify(draft));
}

// 문의 양식 초안 불러오기
function loadContactDraft() {
    const draft = localStorage.getItem(STORAGE_KEYS.CONTACT_DRAFT);
    if (draft) {
        const draftData = JSON.parse(draft);
        document.getElementById('name').value = draftData.name || '';
        document.getElementById('email').value = draftData.email || '';
        document.getElementById('message').value = draftData.message || '';
    }
}

// 문의 양식 초안 삭제
function clearContactDraft() {
    localStorage.removeItem(STORAGE_KEYS.CONTACT_DRAFT);
}

// 알림 메시지 표시
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 스타일 적용
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // 타입별 색상
    if (type === 'success') {
        notification.style.backgroundColor = '#27ae60';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#e74c3c';
    } else {
        notification.style.backgroundColor = '#3498db';
    }
    
    document.body.appendChild(notification);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 키보드 이벤트 처리 (ESC로 모달 닫기)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (favoritesModal.style.display === 'block') {
            closeFavoritesModal();
        }
    }
});

// 페이지 언로드 시 문의 양식 자동 저장
window.addEventListener('beforeunload', saveContactDraft);

// 스크롤 애니메이션 초기화
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // 관찰할 요소들
    const animatedElements = document.querySelectorAll('.research-card, .value-item, .about-content, .contact-content');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// 성능 최적화: 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 스크롤 이벤트 최적화
const debouncedScrollHandler = debounce(handleScroll, 10);
window.addEventListener('scroll', debouncedScrollHandler);

// 이상성욕 연구소로 이동
function goToAbnormalSexualityLab() {
    window.location.href = '이상성욕연구소';
}

// 즐겨찾기 로드
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p style="color: #aaa; text-align: center;">즐겨찾기에 추가된 항목이 없습니다.</p>';
        return;
    }
    
    favoritesList.innerHTML = favorites.map((favorite, index) => `
        <div class="favorite-item">
            <div class="favorite-info">
                <div class="favorite-title">${favorite.title}</div>
                <div class="favorite-description">${favorite.description}</div>
            </div>
            <button class="remove-favorite" onclick="removeFavorite(${index})">&times;</button>
        </div>
    `).join('');
}

// 즐겨찾기 제거
function removeFavorite(index) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
}

// 관심 등록 버튼들
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('interest-btn')) {
        const card = e.target.closest('.research-card');
        const title = card.querySelector('h3').textContent;
        const description = card.querySelector('p').textContent;
        
        addToFavorites(title, description);
        e.target.textContent = '관심 등록됨';
        e.target.style.backgroundColor = '#27ae60';
        e.target.disabled = true;
        
        setTimeout(() => {
            e.target.textContent = '관심 등록';
            e.target.style.backgroundColor = '';
            e.target.disabled = false;
        }, 2000);
    }
});

// 즐겨찾기에 추가
function addToFavorites(title, description) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // 중복 확인
    if (!favorites.some(fav => fav.title === title)) {
        favorites.push({ title, description });
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

// 문의 양식 자동 저장
if (contactForm) {
    const formData = JSON.parse(localStorage.getItem('contactFormData') || '{}');
    
    // 저장된 데이터 복원
    Object.keys(formData).forEach(key => {
        const input = contactForm.querySelector(`[name="${key}"]`);
        if (input) {
            input.value = formData[key];
        }
    });
    
    // 입력시 자동 저장
    contactForm.addEventListener('input', (e) => {
        const formData = new FormData(contactForm);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        localStorage.setItem('contactFormData', JSON.stringify(data));
    });
    
    // 제출 처리
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        // 여기에 실제 제출 로직을 추가할 수 있습니다
        console.log('문의 제출:', data);
        
        // 성공 메시지
        alert('문의가 성공적으로 제출되었습니다!');
        
        // 폼 초기화
        contactForm.reset();
        localStorage.removeItem('contactFormData');
    });
}

// 부드러운 스크롤
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}); 