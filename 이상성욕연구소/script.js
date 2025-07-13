// DOM 요소들
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const favoritesBtn = document.getElementById('favorites-btn');
const favoritesModal = document.getElementById('favorites-modal');
const closeModal = document.getElementById('close-modal');
const favoritesList = document.getElementById('favorites-list');
const contactForm = document.getElementById('contactForm');

// 연구 분야 데이터
const researchData = {
    'psychology-analysis': '심리학적 분석',
    'behavior-pattern': '행동 패턴 연구',
    'social-impact': '사회적 영향 분석',
    'treatment-methods': '치료 방법 연구',
    'data-collection': '데이터 수집 분석',
    'prevention-strategy': '예방 전략 개발'
};

// 로컬 스토리지 키
const STORAGE_KEYS = {
    FAVORITES: 'abnormal_sexuality_favorites',
    CONTACT_DRAFT: 'abnormal_sexuality_contact_draft'
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadContactDraft();
    updateInterestButtons();
});

// 앱 초기화
function initializeApp() {
    // 모바일 네비게이션 토글
    navToggle.addEventListener('click', toggleMobileMenu);
    
    // 즐겨찾기 모달
    favoritesBtn.addEventListener('click', openFavoritesModal);
    closeModal.addEventListener('click', closeFavoritesModal);
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(event) {
        if (event.target === favoritesModal) {
            closeFavoritesModal();
        }
    });
    
    // 문의 양식 제출
    contactForm.addEventListener('submit', handleContactSubmit);
    
    // 문의 양식 자동 저장
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', saveContactDraft);
    });
    
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

// 모바일 메뉴 토글
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
}

// 스크롤 처리
function handleScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(108, 92, 231, 0.98)';
    } else {
        header.style.backgroundColor = 'rgba(108, 92, 231, 0.95)';
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
            toggleMobileMenu();
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
        notification.style.backgroundColor = '#00b894';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#e17055';
    } else {
        notification.style.backgroundColor = '#6c5ce7';
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
    if (e.key === 'Escape' && favoritesModal.style.display === 'block') {
        closeFavoritesModal();
    }
});

// 페이지 언로드 시 문의 양식 자동 저장
window.addEventListener('beforeunload', saveContactDraft);

// 스크롤 애니메이션 (Intersection Observer)
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
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.research-card, .value-item, .about-content, .contact-content');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

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

// 워썬더 연구소로 이동
function goToWarThunderLab() {
    window.location.href = '../index';
} 