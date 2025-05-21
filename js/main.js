function toggleDesignThinking(event) {
    event.preventDefault();
    const dropdown = document.getElementById('designThinkingDropdown');
    dropdown.classList.toggle('show');
    
    // 点击其他地方时关闭下拉菜单
    document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest('.dropdown')) {
            dropdown.classList.remove('show');
            document.removeEventListener('click', closeDropdown);
        }
    });
} 