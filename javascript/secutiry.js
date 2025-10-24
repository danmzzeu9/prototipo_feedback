document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
  
document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') { e.preventDefault(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') { e.preventDefault(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') { e.preventDefault(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-')) { e.preventDefault(); }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') { e.preventDefault(); }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') { e.preventDefault(); }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') { e.preventDefault(); }
});