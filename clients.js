document.addEventListener('DOMContentLoaded', () => {

    // --- INICIALIZACIÓN DE FIREBASE ---
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error("La configuración de Firebase no se ha cargado. Por favor, asegúrate de que firebase-config.js es correcto.");
        const clientList = document.getElementById('client-list');
        clientList.innerHTML = `<p style="color: red; text-align: center;">Error de conexión: La configuración de Firebase no es correcta.</p>`;
        return;
    }
    const db = firebase.firestore();
    const clientsCollection = db.collection('clients');

    // --- ESTADO DE LA APLICACIÓN ---
    let clients = []; // Caché local para los datos de Firestore

    // --- WEB COMPONENTS ---

    // (El código de los Web Components no cambia)
    class ClientCard extends HTMLElement {
        constructor() {
            super();
            const template = document.getElementById('client-card-template').content;
            this.attachShadow({ mode: 'open' }).appendChild(template.cloneNode(true));
        }

        connectedCallback() {
            this.shadowRoot.querySelector('.edit-btn').addEventListener('click', () => this.dispatchEvent(new CustomEvent('edit-client', { detail: { id: this._client.id }, bubbles: true, composed: true })));
            this.shadowRoot.querySelector('.delete-btn').addEventListener('click', () => this.dispatchEvent(new CustomEvent('delete-client', { detail: { id: this._client.id, name: this._client.name }, bubbles: true, composed: true })));
        }

        setClient(client) {
            this._client = client;
            this.shadowRoot.querySelector('.client-name').textContent = client.name;
            this.shadowRoot.querySelector('.client-company').textContent = client.company || '';
            this.shadowRoot.querySelector('.client-email').textContent = client.email;
            this.shadowRoot.querySelector('.client-phone').textContent = client.phone;
        }
    }

    class ClientForm extends HTMLElement {
        constructor() {
            super();
            const template = document.getElementById('client-form-template').content;
            this.attachShadow({ mode: 'open' }).appendChild(template.cloneNode(true));
            this.form = this.shadowRoot.querySelector('#client-form');
            this.titleEl = this.shadowRoot.querySelector('#form-title');
        }

       connectedCallback() {
            this.shadowRoot.querySelector('.cancel-btn').addEventListener('click', () => this.dispatchEvent(new CustomEvent('cancel-form', { bubbles: true, composed: true })));
            this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => this.dispatchEvent(new CustomEvent('cancel-form', { bubbles: true, composed: true })));
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                const clientData = {
                    name: this.form['client-name'].value,
                    company: this.form['client-company'].value,
                    email: this.form['client-email'].value,
                    phone: this.form['client-phone'].value
                };
                const clientId = this.form['client-id'].value;
                this.dispatchEvent(new CustomEvent('save-client', { detail: { id: clientId, data: clientData }, bubbles: true, composed: true }));
            });
        }

        loadClient(client) {
            this.reset();
            this.titleEl.textContent = 'Editar Cliente';
            this.form['client-id'].value = client.id;
            this.form['client-name'].value = client.name;
            this.form['client-company'].value = client.company;
            this.form['client-email'].value = client.email;
            this.form['client-phone'].value = client.phone;
        }
        
        reset() {
            this.titleEl.textContent = 'Añadir Cliente';
            this.form.reset();
            this.form['client-id'].value = '';
        }
    }

    customElements.define('client-card', ClientCard);
    customElements.define('client-form', ClientForm);

    // --- LÓGICA PRINCIPAL ---
    const clientListEl = document.getElementById('client-list');
    const searchInput = document.getElementById('search-input');
    const addClientBtn = document.getElementById('add-client-btn');
    const modalEl = document.getElementById('form-modal');
    const clientFormEl = document.createElement('client-form');
    modalEl.appendChild(clientFormEl);

    const renderClients = () => {
        const searchTerm = searchInput.value.toLowerCase();
        let filtered = clients.filter(c => 
            c.name.toLowerCase().includes(searchTerm) || 
            (c.company && c.company.toLowerCase().includes(searchTerm))
        );

        clientListEl.innerHTML = '';
        filtered.forEach((client, i) => {
            const card = document.createElement('client-card');
            card.style.animationDelay = `${i * 50}ms`;
            card.setClient(client);
            clientListEl.appendChild(card);
        });
    };

    const openFormModal = () => modalEl.style.display = 'flex';
    const closeFormModal = () => modalEl.style.display = 'none';

    // --- MANEJADORES DE EVENTOS DE FIRESTORE ---
    clientsCollection.onSnapshot(snapshot => {
        clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderClients();
    }, error => {
        console.error("Error al obtener los clientes de Firestore: ", error);
        clientListEl.innerHTML = `<p style="color: red; text-align: center;">No se pudieron cargar los clientes. Verifique la consola.</p>`;
    });

    // --- MANEJADORES DE EVENTOS DE LA INTERFAZ ---
    searchInput.addEventListener('input', renderClients);
    addClientBtn.addEventListener('click', () => { clientFormEl.reset(); openFormModal(); });
    document.addEventListener('cancel-form', closeFormModal);

    document.addEventListener('save-client', ({ detail }) => {
        const { id, data } = detail;
        if (id) {
            clientsCollection.doc(id).update(data)
                .then(() => closeFormModal())
                .catch(err => console.error('Error al actualizar el cliente: ', err));
        } else {
            clientsCollection.add(data)
                .then(() => closeFormModal())
                .catch(err => console.error('Error al añadir el cliente: ', err));
        }
    });

    document.addEventListener('edit-client', ({ detail }) => {
        const client = clients.find(c => c.id === detail.id);
        if (client) {
            clientFormEl.loadClient(client);
            openFormModal();
        }
    });

    document.addEventListener('delete-client', ({ detail }) => {
        if (confirm(`¿Estás seguro de que quieres eliminar a "${detail.name}"?`)) {
            clientsCollection.doc(detail.id).delete()
                .catch(err => console.error('Error al eliminar el cliente: ', err));
        }
    });

});
