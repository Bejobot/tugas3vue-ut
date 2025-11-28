new Vue({
    el: '#tracking-app',
    data: {
        // Data from dataBahanAjar.js
        pengirimanList: dataBahanAjar.pengirimanList,
        paket: dataBahanAjar.paket,
        stok: dataBahanAjar.stok,
        
        // Tracking data
        trackingList: [],
        doCounter: 1,
        
        // Form data
        formData: {
            nim: '',
            nama: '',
            ekspedisi: '',
            paket: '',
            tanggalKirim: ''
        },
        
        validationErrors: {}
    },
    
    computed: {
        // Generate DO number automatically
        nomorDO() {
            const year = new Date().getFullYear();
            const sequence = String(this.doCounter).padStart(3, '0');
            return `DO${year}-${sequence}`;
        },
        
        // Get selected paket details
        selectedPaket() {
            if (!this.formData.paket) return null;
            return this.paket.find(p => p.kode === this.formData.paket);
        }
    },
    
    watch: {
        // Watcher 1: Monitor paket selection
        'formData.paket'(newVal, oldVal) {
            if (newVal) {
                const paket = this.paket.find(p => p.kode === newVal);
                console.log(`Paket dipilih: ${paket.nama} - Rp ${paket.harga}`);
            }
        },
        
        // Watcher 2: Monitor NIM input
        'formData.nim'(newVal) {
            if (newVal && !/^\d+$/.test(newVal)) {
                console.log('⚠️ NIM harus berupa angka');
            }
        }
    },
    
    mounted() {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        this.formData.tanggalKirim = today;
        
        // Load initial tracking data if exists
        if (dataBahanAjar.tracking) {
            Object.keys(dataBahanAjar.tracking).forEach(key => {
                const tracking = dataBahanAjar.tracking[key];
                this.trackingList.push({
                    nomorDO: key,
                    ...tracking
                });
            });
            // Set counter based on existing data
            if (this.trackingList.length > 0) {
                const lastDO = this.trackingList[this.trackingList.length - 1].nomorDO;
                const lastSequence = parseInt(lastDO.split('-')[1]);
                this.doCounter = lastSequence + 1;
            }
        }
    },
    
    methods: {
        // Paket change handler
        onPaketChange() {
            // Additional logic when paket changes if needed
        },
        
        // Validate form
        validateForm() {
            this.validationErrors = {};
            
            // Validate NIM
            if (!/^\d{9}$/.test(this.formData.nim)) {
                this.validationErrors.nim = 'NIM harus 9 digit angka';
            }
            
            // Validate Nama
            if (this.formData.nama.length < 3) {
                this.validationErrors.nama = 'Nama minimal 3 karakter';
            }
            
            return Object.keys(this.validationErrors).length === 0;
        },
        
        // Add delivery order
        addDeliveryOrder() {
            if (!this.validateForm()) {
                alert('Mohon periksa kembali data yang diisi');
                return;
            }
            
            const paket = this.paket.find(p => p.kode === this.formData.paket);
            
            const newDO = {
                nomorDO: this.nomorDO,
                nim: this.formData.nim,
                nama: this.formData.nama,
                ekspedisi: this.formData.ekspedisi,
                tanggalKirim: this.formData.tanggalKirim,
                paket: this.formData.paket,
                total: paket.harga,
                status: 'Diproses',
                perjalanan: [
                    {
                        waktu: new Date().toLocaleString('id-ID'),
                        keterangan: 'Pesanan dibuat dan sedang diproses'
                    }
                ]
            };
            
            this.trackingList.push(newDO);
            this.doCounter++;
            
            alert(`Delivery Order ${newDO.nomorDO} berhasil dibuat!`);
            this.resetForm();
        },
        
        // Reset form
        resetForm() {
            this.formData = {
                nim: '',
                nama: '',
                ekspedisi: '',
                paket: '',
                tanggalKirim: new Date().toISOString().split('T')[0]
            };
            this.validationErrors = {};
        },
        
        // Helper methods
        formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        },
        
        getMataKuliahName(kode) {
            const mk = this.stok.find(s => s.kode === kode);
            return mk ? mk.judul : kode;
        },
        
        getEkspedisiName(kode) {
            const exp = this.pengirimanList.find(e => e.kode === kode);
            return exp ? exp.nama : kode;
        },
        
        getStatusClass(status) {
            const statusMap = {
                'Diproses': 'status-processing',
                'Dalam Perjalanan': 'status-shipping',
                'Terkirim': 'status-delivered'
            };
            return statusMap[status] || '';
        }
    }
});
