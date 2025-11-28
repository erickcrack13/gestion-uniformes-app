document.addEventListener('DOMContentLoaded', () => {

    // --- DATOS (DE EJEMPLO) ---
    const featuredProducts = [
        {
            id: 1,
            name: 'Uniforme Médico Premium',
            priceUSD: 42.50, 
            image: 'https://images.unsplash.com/photo-1618797332067-9b2f342a35d8?q=80&w=870&auto=format&fit=crop'
        },
        {
            id: 2,
            name: 'Uniforme de Chef Ejecutivo',
            priceUSD: 55.00, 
            image: 'https://images.unsplash.com/photo-1547496614-54c41a87c1f4?q=80&w=870&auto=format&fit=crop'
        },
        {
            id: 3,
            name: 'Uniforme Técnico Resistente',
            priceUSD: 65.90, 
            image: 'https://images.unsplash.com/photo-1593121924294-9c9885822359?q=80&w=870&auto=format&fit=crop'
        },
         {
            id: 4,
            name: 'Diseño Corporativo Elegante',
            priceUSD: 29.00, 
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=870&auto=format&fit=crop'
        }
    ];

    // --- COMPONENTE WEB PARA LAS TARJETAS DE PRODUCTO ---
    class LandingProductCard extends HTMLElement {
        constructor() {
            super();
            const template = document.getElementById('landing-product-card-template').content;
            this.attachShadow({ mode: 'open' }).appendChild(template.cloneNode(true));
        }

        setProduct(product, exchangeRate) {
            const priceVES = product.priceUSD * exchangeRate;
            this.shadowRoot.querySelector('h3').textContent = product.name;
            this.shadowRoot.querySelector('.price').textContent = `VES ${priceVES.toFixed(2)}`;
            this.shadowRoot.querySelector('img').src = product.image || 'https://via.placeholder.com/300x200.png?text=Sin+Imagen';
            this.shadowRoot.querySelector('img').alt = product.name;
        }
    }
    customElements.define('landing-product-card', LandingProductCard);

    // --- RENDERIZADO DE PRODUCTOS ---
    const productListEl = document.getElementById('product-preview-list');
    if (productListEl) {
        function renderProducts() {
            const exchangeRate = parseFloat(localStorage.getItem('exchangeRateVES')) || 36.50; // Tasa por defecto
            productListEl.innerHTML = ''; 
            featuredProducts.forEach((product, index) => {
                const productCard = document.createElement('landing-product-card');
                productCard.setProduct(product, exchangeRate);
                productCard.style.animationDelay = `${index * 100}ms`;
                productListEl.appendChild(productCard);
            });
        }
        renderProducts();
    }

    // --- EFECTOS VISUALES PROFESIONALES ---
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '0.5rem 0';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.padding = '1rem 0';
            header.style.backgroundColor = '#fff';
            header.style.backdropFilter = 'none';
        }
    });

    const sectionsToAnimate = document.querySelectorAll('.our-values, .featured-products, .testimonials');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sectionsToAnimate.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
    });

});
