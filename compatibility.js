// Cross-browser compatibility and polyfills
(function() {
    'use strict';

    // Check for browser support and apply polyfills if needed
    function checkCompatibility() {
        const compatibilityIssues = [];
        
        // Check for localStorage support
        if (!window.localStorage) {
            compatibilityIssues.push('localStorage');
            polyfillLocalStorage();
        }
        
        // Check for ES6 features
        if (typeof Promise === 'undefined') {
            compatibilityIssues.push('Promises');
            loadPolyfill('promise-polyfill');
        }
        
        // Check for CSS Grid support
        if (!CSS.supports('display', 'grid')) {
            compatibilityIssues.push('CSS Grid');
            document.documentElement.classList.add('no-css-grid');
        }
        
        // Check for Flexbox support
        if (!CSS.supports('display', 'flex')) {
            compatibilityIssues.push('Flexbox');
            document.documentElement.classList.add('no-flexbox');
        }
        
        if (compatibilityIssues.length > 0) {
            console.warn('Compatibility issues detected:', compatibilityIssues);
            showCompatibilityNotice(compatibilityIssues);
        }
    }

    // Simple localStorage polyfill
    function polyfillLocalStorage() {
        window.localStorage = {
            _data: {},
            setItem: function(id, val) {
                this._data[id] = String(val);
                // Also store in cookies as fallback
                document.cookie = `surveypro_${id}=${val}; path=/; max-age=31536000`;
            },
            getItem: function(id) {
                // Try to get from cookie if not in memory
                if (!this._data.hasOwnProperty(id)) {
                    const name = `surveypro_${id}=`;
                    const cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        let cookie = cookies[i].trim();
                        if (cookie.indexOf(name) === 0) {
                            this._data[id] = cookie.substring(name.length, cookie.length);
                            break;
                        }
                    }
                }
                return this._data.hasOwnProperty(id) ? this._data[id] : null;
            },
            removeItem: function(id) {
                delete this._data[id];
                document.cookie = `surveypro_${id}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
            },
            clear: function() {
                this._data = {};
                // Clear all surveypro cookies
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.indexOf('surveypro_') === 0) {
                        const cookieName = cookie.split('=')[0];
                        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
                    }
                }
            }
        };
    }

    // Load external polyfill
    function loadPolyfill(polyfillName) {
        const polyfills = {
            'promise-polyfill': 'https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js'
        };
        
        if (polyfills[polyfillName]) {
            const script = document.createElement('script');
            script.src = polyfills[polyfillName];
            document.head.appendChild(script);
        }
    }

    // Show compatibility notice for unsupported browsers
    function showCompatibilityNotice(issues) {
        const notice = document.createElement('div');
        notice.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ffc107;
            color: #856404;
            padding: 15px;
            text-align: center;
            z-index: 10000;
            border-bottom: 1px solid #ffeaa7;
            font-family: Arial, sans-serif;
        `;
        
        notice.innerHTML = `
            <strong>Browser Compatibility Notice:</strong> 
            Your browser has limited support for some features. 
            For the best experience, please update to a modern browser like 
            <a href="https://www.google.com/chrome/" style="color: #856404; text-decoration: underline;">Chrome</a>, 
            <a href="https://www.mozilla.org/firefox/" style="color: #856404; text-decoration: underline;">Firefox</a>, or 
            <a href="https://www.microsoft.com/edge" style="color: #856404; text-decoration: underline;">Edge</a>.
            <button onclick="this.parentElement.style.display='none'" style="margin-left: 10px; background: none; border: 1px solid #856404; color: #856404; padding: 2px 8px; border-radius: 3px; cursor: pointer;">×</button>
        `;
        
        document.body.insertBefore(notice, document.body.firstChild);
    }

    // Device detection and optimization
    function optimizeForDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
        const isTablet = /tablet|ipad/i.test(userAgent);
        const isIOS = /iphone|ipad|ipod/i.test(userAgent);
        const isAndroid = /android/i.test(userAgent);
        const isSlowConnection = navigator.connection && 
            (navigator.connection.saveData || 
             navigator.connection.effectiveType === 'slow-2g' || 
             navigator.connection.effectiveType === '2g');

        // Add device-specific classes to HTML element
        const html = document.documentElement;
        if (isMobile) html.classList.add('mobile-device');
        if (isTablet) html.classList.add('tablet-device');
        if (isIOS) html.classList.add('ios-device');
        if (isAndroid) html.classList.add('android-device');
        if (isSlowConnection) html.classList.add('slow-connection');

        // Optimize for slow connections
        if (isSlowConnection) {
            // Lazy load non-critical resources
            lazyLoadResources();
            // Reduce animations
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
        }

        // iOS-specific optimizations
        if (isIOS) {
            // Fix for iOS viewport height issues
            fixIosViewport();
            // Prevent zoom on focus
            preventZoomOnFocus();
        }
    }

    // Fix for iOS viewport height
    function fixIosViewport() {
        const setVh = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVh();
        window.addEventListener('resize', setVh);
        window.addEventListener('orientationchange', setVh);
    }

    // Prevent zoom on focus in iOS
    function preventZoomOnFocus() {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    }

    // Lazy load non-critical resources
    function lazyLoadResources() {
        const lazyImages = [].slice.call(document.querySelectorAll('img.lazy'));
        const lazyBackgrounds = [].slice.call(document.querySelectorAll('[data-bg]'));

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(function(img) {
                imageObserver.observe(img);
            });
        }
    }

    // Touch device optimizations
    function optimizeForTouch() {
        // Add touch-specific event listeners
        if ('ontouchstart' in window) {
            document.documentElement.classList.add('touch-device');
            
            // Improve touch feedback
            const buttons = document.querySelectorAll('.btn, .task-card, .package-card');
            buttons.forEach(btn => {
                btn.addEventListener('touchstart', function() {
                    this.classList.add('touch-active');
                });
                btn.addEventListener('touchend', function() {
                    this.classList.remove('touch-active');
                });
            });
        } else {
            document.documentElement.classList.add('no-touch-device');
        }
    }

    // Performance monitoring
    function monitorPerformance() {
        // Monitor load time
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            if (loadTime > 3000) { // If load time > 3 seconds
                console.warn('Slow page load detected:', loadTime + 'ms');
            }
        });

        // Monitor task completion performance
        const originalSubmitTask = window.submitTask;
        if (originalSubmitTask) {
            window.submitTask = function() {
                const startTime = performance.now();
                const result = originalSubmitTask.apply(this, arguments);
                const endTime = performance.now();
                
                if (endTime - startTime > 1000) { // If task submission takes > 1 second
                    console.warn('Slow task submission detected:', (endTime - startTime) + 'ms');
                }
                
                return result;
            };
        }
    }

    // Initialize all compatibility features
    function initCompatibility() {
        checkCompatibility();
        optimizeForDevice();
        optimizeForTouch();
        monitorPerformance();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCompatibility);
    } else {
        initCompatibility();
    }

    // Export for global access if needed
    window.SurveyProCompatibility = {
        checkCompatibility,
        optimizeForDevice,
        optimizeForTouch
    };
})();