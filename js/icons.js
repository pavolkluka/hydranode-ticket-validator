// Minimalist SVG Icon Library for Hydranode Ticket Validator
// All icons are designed with a minimalist approach using clean lines and simple shapes

class IconLibrary {
    constructor() {
        this.icons = this.loadIcons();
    }

    loadIcons() {
        return {
            // App icon - Hydranode logo simplified
            logo: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" data-primary="true"/>
                <path d="M2 7L12 12L22 7" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <path d="M12 22V12" stroke="currentColor" stroke-width="2"/>
            </svg>`,

            // Menu/Options
            menu: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>`,

            // Close/X
            close: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>`,

            // Search/Magnifying Glass
            search: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,

            // Upload/File
            upload: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="7,10 12,5 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="5" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>`,

            // Language/Globe
            language: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2"/>
                <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" stroke-width="2"/>
            </svg>`,

            // Theme/Sun (light mode)
            sun: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>`,

            // Theme/Moon (dark mode)
            moon: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1583 17.4668C18.1127 18.8192 16.7035 19.8458 15.0957 20.4265C13.4879 21.0073 11.7479 21.1181 10.0795 20.7461C8.41104 20.3741 6.88302 19.5345 5.6707 18.3223C4.45838 17.11 3.61876 15.582 3.24672 13.9135C2.87469 12.2451 2.98552 10.5051 3.56627 8.8973C4.14703 7.28954 5.17362 5.88026 6.52603 4.83466C7.87844 3.78906 9.50061 3.15033 11.21 2.99C10.2133 4.34827 9.73375 6.00945 9.85843 7.68141C9.98312 9.35338 10.7038 10.9251 11.8894 12.1107C13.075 13.2963 14.6467 14.0169 16.3186 14.1416C17.9906 14.2663 19.6518 13.7867 21.01 12.79H21Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>`,

            // Scanner/Camera
            scanner: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>`,

            // QR Code
            qrcode: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" fill="none"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" fill="none"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" fill="none"/>
                <rect x="5" y="5" width="3" height="3" fill="currentColor"/>
                <rect x="16" y="5" width="3" height="3" fill="currentColor"/>
                <rect x="5" y="16" width="3" height="3" fill="currentColor"/>
                <rect x="14" y="14" width="2" height="2" fill="currentColor"/>
                <rect x="17" y="14" width="2" height="2" fill="currentColor"/>
                <rect x="20" y="17" width="1" height="1" fill="currentColor"/>
                <rect x="14" y="17" width="1" height="1" fill="currentColor"/>
                <rect x="19" y="20" width="2" height="1" fill="currentColor"/>
            </svg>`,
            
            // QR Code (alias)
            qr: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" fill="none"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" fill="none"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" fill="none"/>
                <rect x="5" y="5" width="3" height="3" fill="currentColor"/>
                <rect x="16" y="5" width="3" height="3" fill="currentColor"/>
                <rect x="5" y="16" width="3" height="3" fill="currentColor"/>
                <rect x="14" y="14" width="2" height="2" fill="currentColor"/>
                <rect x="17" y="14" width="2" height="2" fill="currentColor"/>
                <rect x="20" y="17" width="1" height="1" fill="currentColor"/>
                <rect x="14" y="17" width="1" height="1" fill="currentColor"/>
                <rect x="19" y="20" width="2" height="1" fill="currentColor"/>
            </svg>`,
            
            // Cloud/API
            cloud: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 10C18.626 10 19.2092 9.84196 19.7134 9.56066C20.2176 9.27936 20.621 8.8918 20.8817 8.42583C21.1425 7.95987 21.2507 7.43506 21.1936 6.91718C21.1365 6.3993 20.9174 5.90861 20.5656 5.51472C20.2138 5.12084 19.7474 4.84379 19.2418 4.72209C18.7361 4.60039 18.2092 4.63998 17.7254 4.83647C17.2416 5.03297 16.8207 5.37633 16.5147 5.82218C16.2087 6.26804 16.031 6.79693 16.005 7.34C15.6815 7.12046 15.3165 6.97287 14.9313 6.90622C14.546 6.8396 14.1495 6.85542 13.7698 6.95251C13.3901 7.0496 13.0356 7.22587 12.7299 7.46941C12.4241 7.71295 12.1743 8.01851 11.9969 8.36666C11.8195 8.71482 11.7185 9.09746 11.7005 9.48846C11.6825 9.87946 11.7479 10.2693 11.8925 10.6321C12.0372 10.9948 12.2578 11.3221 12.5404 11.5928C12.8229 11.8634 13.1613 12.0713 13.532 12.203L13.532 12.203C14.213 12.4687 15 12.4687 15 13C15 14 14 15 13 15H6.5C5.17392 15 3.90215 14.4732 2.96447 13.5355C2.02678 12.5979 1.5 11.3261 1.5 10C1.5 8.67392 2.02678 7.40215 2.96447 6.46447C3.90215 5.52678 5.17392 5 6.5 5C7.82608 5 9.09785 5.52678 10.0355 6.46447C10.9732 7.40215 11.5 8.67392 11.5 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            
            // Eye (visible)
            eye: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>`,
            
            // Eye Off (hidden)
            eyeOff: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 4.028 7.66699 6.17 6.17L17.94 17.94Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19L9.9 4.24Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>`,
            
            // WiFi/Network
            wifi: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12.55C6.913 10.73 9.348 9.689 12 9.689C14.652 9.689 17.087 10.73 19 12.55" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M1.42 9C4.59934 6.05542 8.71167 4.43718 13 4.43718C17.2883 4.43718 21.4007 6.05542 24.58 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8.53 16.11C9.37445 15.365 10.4675 14.9436 11.605 14.9436C12.7425 14.9436 13.8356 15.365 14.68 16.11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="20" r="1" fill="currentColor"/>
            </svg>`,
            
            // Key/Authentication
            key: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 2L19 4L15 8L13 6L11 8C10.5 8.5 10 9 10 10S10.5 11.5 11 12L3 20L4 21L5 20L4 19L5 18L6 19L7 18L6 17L7 16L8 17L9 16L8 15L9 14L8 13L9 12C9.5 11.5 10 11 11 11S12.5 11.5 13 12L15 10L17 12L21 8L23 6L21 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <circle cx="17" cy="7" r="1" fill="currentColor"/>
            </svg>`,

            // Play/Start
            play: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>`,

            // Stop
            stop: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="12" height="12" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>`,

            // Statistics/Chart
            chart: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>`,

            // History/Clock
            history: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,

            // Data/Database
            database: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" stroke-width="2"/>
                <path d="M21 12C21 13.66 16.97 15 12 15S3 13.66 3 12" stroke="currentColor" stroke-width="2"/>
                <path d="M3 5V19C3 20.66 7.03 22 12 22S21 20.66 21 19V5" stroke="currentColor" stroke-width="2"/>
            </svg>`,

            // Check/Valid
            check: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,

            // X/Invalid
            x: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>`,

            // Warning/Alert
            warning: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.29 3.86L1.82 18C1.64466 18.3024 1.55611 18.6453 1.56331 18.9945C1.57051 19.3437 1.67319 19.6831 1.86 19.98C2.04681 20.2769 2.31061 20.5228 2.6235 20.6928C2.93638 20.8627 3.28872 20.9507 3.647 20.949H20.353C20.7113 20.9507 21.0636 20.8627 21.3765 20.6928C21.6894 20.5228 21.9532 20.2769 22.14 19.98C22.3268 19.6831 22.4295 19.3437 22.4367 18.9945C22.4439 18.6453 22.3553 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2694 3.32312 12.9535 3.15448C12.6375 2.98585 12.2796 2.89725 11.9155 2.89725C11.5515 2.89725 11.1935 2.98585 10.8776 3.15448C10.5616 3.32312 10.2994 3.56611 10.121 3.86H10.29Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>`,

            // Export/Download
            export: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="17,11 12,16 7,11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="16" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>`,

            // Clear/Trash
            trash: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>`,

            // Settings/Cog
            settings: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>`,

            // Arrow Left
            arrowLeft: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="19" y1="12" x2="5" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <polyline points="12,19 5,12 12,5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,

            // Arrow Right
            arrowRight: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <polyline points="12,5 19,12 12,19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,

            // List/Table - minimalist lines icon
            list: `<svg class="theme-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>`
        };
    }

    getIcon(name, size = '24', className = '') {
        // Special handling for app logo - use PNG files from logos directory
        if (name === 'appLogo') {
            return this.getAppLogo(size, className);
        }
        
        const icon = this.icons[name];
        if (!icon) {
            console.warn(`Icon "${name}" not found`);
            return `<span class="icon-missing">${name}</span>`;
        }

        // Add size and custom classes
        const modifiedIcon = icon.replace(
            'class="theme-svg"', 
            `class="theme-svg icon icon-${name} ${className}" width="${size}" height="${size}"`
        );

        return modifiedIcon;
    }

    // Get the appropriate app logo based on current theme
    getAppLogo(size = '32', className = '') {
        const isDarkTheme = window.ThemeManager ? window.ThemeManager.isDarkTheme() : true;
        
        // Use theme-appropriate icons from the icons/ folder
        // Dark icons for dark theme, light icons for light theme
        const iconFile = isDarkTheme ? 'icon-dark-192x192.png' : 'icon-light-192x192.png';
        
        // Convert size to number if it's a string
        const iconSize = typeof size === 'string' ? parseInt(size) : size;
        
        return `<img src="icons/${iconFile}" 
                     alt="Hydranode Logo" 
                     class="app-logo-img ${className}" 
                     width="${iconSize}" 
                     height="${iconSize}" 
                     style="object-fit: contain; width: ${iconSize}px; height: ${iconSize}px;">`;
    }

    getAllIcons() {
        return Object.keys(this.icons);
    }

    // Create an icon element that can be inserted into the DOM
    createElement(name, size = '24', className = '') {
        const div = document.createElement('div');
        div.innerHTML = this.getIcon(name, size, className);
        return div.firstElementChild;
    }

    // Update all theme-aware icons when theme changes
    updateThemeIcons() {
        document.querySelectorAll('.theme-svg').forEach(svg => {
            const computedStyle = getComputedStyle(svg);
            const currentColor = computedStyle.color;
            
            // Update stroke and fill colors
            svg.querySelectorAll('[stroke="currentColor"]').forEach(element => {
                element.setAttribute('stroke', currentColor);
            });
            
            svg.querySelectorAll('[fill="currentColor"]').forEach(element => {
                element.setAttribute('fill', currentColor);
            });
        });

        // Update app logo for theme change
        this.updateAppLogo();
    }

    // Update app logo when theme changes
    updateAppLogo() {
        const appIconElement = document.getElementById('appIcon');
        if (appIconElement) {
            // Always use the standard size for consistency
            appIconElement.innerHTML = this.getAppLogo('32');
        }
        
        // Also update the favicon and apple touch icons
        this.updateFavicon();
    }

    // Update favicon based on current theme
    updateFavicon() {
        const isDarkTheme = window.ThemeManager ? window.ThemeManager.isDarkTheme() : true;
        const iconPrefix = isDarkTheme ? 'icon-dark' : 'icon-light';
        
        // Update main favicon
        const favicon = document.getElementById('favicon');
        if (favicon) {
            favicon.href = `icons/${iconPrefix}-192x192.png`;
        }
        
        // Update apple touch icons
        const appleTouchIcon = document.getElementById('appleTouchIcon');
        if (appleTouchIcon) {
            appleTouchIcon.href = `icons/${iconPrefix}-192x192.png`;
        }
        
        // Update other apple touch icon sizes
        const appleTouchIcons = document.querySelectorAll('link[rel="apple-touch-icon"][sizes]');
        appleTouchIcons.forEach(icon => {
            const sizes = icon.getAttribute('sizes');
            if (sizes) {
                const size = sizes.split('x')[0]; // Get width dimension
                icon.href = `icons/${iconPrefix}-${size}x${size}.png`;
            }
        });
        
        // Update any other favicon-related elements
        const shortcutIcon = document.querySelector('link[rel="shortcut icon"]');
        if (shortcutIcon) {
            shortcutIcon.href = `icons/${iconPrefix}-192x192.png`;
        }
    }
}

// Create global instance
const iconLibrary = new IconLibrary();

// Export for use in other scripts
window.IconLibrary = iconLibrary;

// Listen for theme changes and update icons
function registerThemeCallback() {
    if (typeof window.ThemeManager !== 'undefined') {
        window.ThemeManager.registerCallback(() => {
            iconLibrary.updateThemeIcons();
        });
    } else {
        // Retry after DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (typeof window.ThemeManager !== 'undefined') {
                    window.ThemeManager.registerCallback(() => {
                        iconLibrary.updateThemeIcons();
                    });
                }
                // Initialize favicon after theme manager is ready
                initializeFavicon();
            }, 100);
        });
    }
}

// Initialize favicon on page load
function initializeFavicon() {
    if (iconLibrary && iconLibrary.updateFavicon) {
        iconLibrary.updateFavicon();
    }
}

// Initialize favicon immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFavicon);
} else {
    initializeFavicon();
}

// Register theme callback
registerThemeCallback();