document.addEventListener('DOMContentLoaded', () => {

    // --- INICIALIZACIÓN DE FIREBASE ---
    // Comprueba si Firebase ya está inicializado
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error("La configuración de Firebase no se ha cargado. Por favor, asegúrate de que firebase-config.js es correcto.");
        // Opcional: mostrar un mensaje al usuario en la UI
        const productList = document.getElementById('product-list');
        productList.innerHTML = `<p style="color: red; text-align: center;">Error de conexión: La configuración de Firebase no es correcta. Contacta al administrador.</p>`;
        return;
    }
    const db = firebase.firestore();
    const productsCollection = db.collection('products');

    // --- ESTADO DE LA APLICACIÓN ---
    let products = []; // El array local ahora es un caché de los datos de Firestore
    let currentSort = 'name-asc';

    // --- WEB COMPONENTS ---

    // ... (El código de los Web Components no cambia)
    class ProductCard extends HTMLElement { 
        constructor() {
            super();
            const template = document.getElementById('product-card-template').content;
            this.attachShadow({ mode: 'open' }).appendChild(template.cloneNode(true));
        }

        connectedCallback() {
            this.shadowRoot.querySelector('.edit').addEventListener('click', () => this.dispatchEvent(new CustomEvent('edit-product', { detail: { id: this._product.id }, bubbles: true, composed: true })));
            this.shadowRoot.querySelector('.delete').addEventListener('click', () => this.dispatchEvent(new CustomEvent('delete-product', { detail: { id: this._product.id, name: this._product.name }, bubbles: true, composed: true })));
            this.shadowRoot.querySelector('.stock-in').addEventListener('click', () => this.dispatchEvent(new CustomEvent('update-stock', { detail: { id: this._product.id, amount: 1 }, bubbles: true, composed: true })));
            this.shadowRoot.querySelector('.stock-out').addEventListener('click', () => this.dispatchEvent(new CustomEvent('update-stock', { detail: { id: this._product.id, amount: -1 }, bubbles: true, composed: true })));
        }

        setProduct(product, rate) {
            this._product = product;
            this.shadowRoot.querySelector('img').src = product.image || 'https://via.placeholder.com/300x200.png?text=Sin+Imagen';
            this.shadowRoot.querySelector('h3').textContent = product.name;
            this.shadowRoot.querySelector('.stock').textContent = `Stock: ${product.stock}`;
            this.shadowRoot.querySelector('.price-ves').textContent = `VES ${(product.price * rate).toFixed(2)}`;
            this.shadowRoot.querySelector('.price-usd').textContent = `($${product.price.toFixed(2)} USD)`;
        }
    }

    class ProductForm extends HTMLElement {
         constructor() {
            super();
            const template = document.getElementById('product-form-template').content;
            this.attachShadow({ mode: 'open' }).appendChild(template.cloneNode(true));
            this.form = this.shadowRoot.querySelector('#product-form');
            this.titleEl = this.shadowRoot.querySelector('#form-title');
        }

        connectedCallback() {
            this.shadowRoot.querySelector('.cancel-btn').addEventListener('click', () => this.dispatchEvent(new CustomEvent('cancel-form', { bubbles: true, composed: true })));
            this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => this.dispatchEvent(new CustomEvent('cancel-form', { bubbles: true, composed: true })));
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                const productData = {
                    // El id ahora se gestiona en el evento save-product
                    name: this.form['product-name'].value,
                    price: parseFloat(this.form['product-price'].value),
                    stock: parseInt(this.form['product-stock'].value),
                    image: this.form['product-image'].value
                };
                 const productId = this.form['product-id'].value;
                this.dispatchEvent(new CustomEvent('save-product', { detail: { id: productId, data: productData }, bubbles: true, composed: true }));
            });
        }

        loadProduct(product) {
            this.reset();
            this.titleEl.textContent = 'Editar Producto';
            this.form['product-id'].value = product.id;
            this.form['product-name'].value = product.name;
            this.form['product-price'].value = product.price;
            this.form['product-stock'].value = product.stock;
            this.form['product-image'].value = product.image;
        }

        reset() {
            this.titleEl.textContent = 'Añadir Producto';
            this.form.reset();
            this.form['product-id'].value = '';
        }
    }

    customElements.define('product-card', ProductCard);
    customElements.define('product-form', ProductForm);

    // --- LÓGICA DE LA APLICACIÓN ---
    const productListEl = document.getElementById('product-list');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const exchangeRateInput = document.getElementById('exchange-rate');
    const addProductBtn = document.getElementById('add-product-btn');
    const modalEl = document.getElementById('form-modal');
    const productFormEl = document.createElement('product-form');
    modalEl.appendChild(productFormEl);

    const renderProducts = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const exchangeRate = parseFloat(exchangeRateInput.value) || 36.5;

        let filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm));

        // Ordenamiento
        filtered.sort((a, b) => {
            switch (currentSort) {
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                default: return 0;
            }
        });

        productListEl.innerHTML = '';
        filtered.forEach((product, i) => {
            const card = document.createElement('product-card');
            card.style.animationDelay = `${i * 40}ms`;
            card.setProduct(product, exchangeRate);
            productListEl.appendChild(card);
        });
    };
    
    const openFormModal = () => modalEl.style.display = 'flex';
    const closeFormModal = () => modalEl.style.display = 'none';

    // --- MANEJADORES DE EVENTOS DE FIRESTORE ---
    productsCollection.onSnapshot(snapshot => {
        products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProducts();
    }, error => {
        console.error("Error al obtener los productos de Firestore: ", error);
        productListEl.innerHTML = `<p style="color: red; text-align: center;">No se pudieron cargar los productos. Verifique la consola.</p>`;
    });

    // --- MANEJADORES DE EVENTOS DE LA INTERFAZ ---
    searchInput.addEventListener('input', renderProducts);
    sortSelect.addEventListener('change', (e) => { currentSort = e.target.value; renderProducts(); });
    exchangeRateInput.addEventListener('change', renderProducts);
    addProductBtn.addEventListener('click', () => { productFormEl.reset(); openFormModal(); });
    document.addEventListener('cancel-form', closeFormModal);

    document.addEventListener('save-product', ({ detail }) => {
        const { id, data } = detail;
        if (id) {
            // Actualizar
            productsCollection.doc(id).update(data)
                .then(() => closeFormModal())
                .catch(err => console.error('Error al actualizar el producto: ', err));
        } else {
            // Crear
            productsCollection.add(data)
                .then(() => closeFormModal())
                .catch(err => console.error('Error al añadir el producto: ', err));
        }
    });

    document.addEventListener('delete-product', ({ detail }) => {
        if (confirm(`¿Estás seguro de que quieres eliminar "${detail.name}"?`)) {
            productsCollection.doc(detail.id).delete()
                .catch(err => console.error('Error al eliminar el producto: ', err));
        }
    });

     document.addEventListener('update-stock', ({ detail }) => {
        const { id, amount } = detail;
        const productRef = productsCollection.doc(id);

        db.runTransaction(transaction => {
            return transaction.get(productRef).then(doc => {
                if (!doc.exists) { throw "¡El documento no existe!"; }
                
                const newStock = doc.data().stock + amount;
                if (newStock < 0) { 
                    alert("No se puede tener stock negativo.");
                    return Promise.reject("Stock insuficiente");
                }
                transaction.update(productRef, { stock: newStock });
            });
        }).catch(err => console.error("Error en la transacción de stock: ", err));
    });

});
