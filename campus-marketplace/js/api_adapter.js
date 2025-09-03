// Lightweight adapter to redirect database operations to FastAPI backend
(function(){
    const API_BASE = window.API_BASE_URL || '/api';

    async function http(method, path, body){
        const res = await fetch(`${API_BASE}${path}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
        });
        if (!res.ok) {
            const txt = await res.text().catch(()=>'')
            throw new Error(`API error ${res.status}: ${txt}`);
        }
        return res.status === 204 ? null : res.json();
    }

    async function listUsers(){
        return http('GET', '/users');
    }

    async function searchListings(filters = {}){
        const params = new URLSearchParams();
        if (filters.query) params.set('q', filters.query);
        if (filters.category) params.set('category', filters.category);
        if (typeof filters.minPrice === 'number') params.set('min_price', filters.minPrice);
        if (typeof filters.maxPrice === 'number') params.set('max_price', filters.maxPrice);
        if (filters.sort) params.set('sort', filters.sort);
        params.set('page', filters.page || 1);
        params.set('page_size', filters.pageSize || 12);
        const data = await http('GET', `/listings?${params.toString()}`);
        return data;
    }

    async function addListing(listingData){
        // Expect listingData to align with ListingCreate; ensure seller_id present
        if (!listingData.seller_id && listingData.sellerId) {
            listingData.seller_id = listingData.sellerId;
        }
        return http('POST', '/listings', listingData);
    }

    async function updateListing(listingId, updatedData){
        return http('PUT', `/listings/${listingId}`, updatedData);
    }

    async function deleteListing(listingId){
        return http('DELETE', `/listings/${listingId}`);
    }

    // If CampusMarketplaceDB exists, override methods to use backend
    if (window.CampusMarketplaceDB) {
        const original = window.CampusMarketplaceDB;
        window.CampusMarketplaceDB = {
            ...original,
            getUsers: async function(){ return await listUsers(); },
            searchListings: async function(filters){ 
                const result = await searchListings(filters || {});
                // Вернём массив объявлений, а также прикрепим мету как свойство массива
                const arr = Array.isArray(result) ? result : (result.items || []);
                try { arr._meta = { total: result.total, page: result.page, page_size: result.page_size }; } catch(e) {}
                return arr;
            },
            addListing: async function(data){ return await addListing(data); },
            updateListing: async function(id, data){ return await updateListing(id, data); },
            deleteListing: async function(id){ return await deleteListing(id); }
        };
        console.log('[API] CampusMarketplaceDB methods are now backed by FastAPI.');
    } else {
        console.warn('[API] CampusMarketplaceDB not found; adapter loaded too early.');
    }
})();