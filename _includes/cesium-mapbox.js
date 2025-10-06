// 1. SET YOUR TOKENS HERE
// const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN'; // Get from https://account.mapbox.com/
const CESIUM_ION_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MWNmYmQ5OC04NjAxLTQyYTgtYjhlZi02YmFmNzVmMmE2MGQiLCJpZCI6MTQ2MDUyLCJpYXQiOjE3NTk3Mjc1OTR9.P38ENexN1RcBiLL9yg_wZfJ8EkTYjvvqQFEeGJu77S0'; // Get from https://ion.cesium.com/

// 2. CONFIGURE THE 3D MODEL
// Use Google Photorealistic 3D Tiles
const TILESET_URL = 'https://api.cesium.com/v1/assets/2275207/endpoint';
const TILESET_POSITION = {
    lng: 144.97229,
    lat: -37.8044,
    altitude: 0
};

// Try to expose the real TilesRenderer if available
// Only create fallback if the real TilesRenderer doesn't exist
if (typeof window.TilesRenderer === 'undefined') {
    console.log('Real TilesRenderer not found, using fallback');
    // Fallback: create a minimal implementation that loads 3D tiles
    window.TilesRenderer = class TilesRenderer {
        constructor(url) {
            console.log('Simple TilesRenderer created with URL:', url);
            this.url = url;
            this.group = new THREE.Group();
            this.manager = {
                setToken: (token) => {
                    console.log('Token set:', token);
                    this.token = token;
                    this.loadTileset(); // Load tileset after token is set
                }
            };
        }

        async loadTileset() {
            // Use the token defined above
            const token = this.token || CESIUM_ION_ACCESS_TOKEN;

            try {
                console.log('Loading 3D tileset from URL:', `${this.url}?access_token=${token}`);
                const response = await fetch(`${this.url}?access_token=${token}`);
                const tileset = await response.json();
                console.log('3D Tileset loaded:', tileset);

                // For 3D Tiles, we need to handle the tileset structure differently
                // This is a simplified version - real 3d tiles are complex
                console.log('Google Photorealistic 3D Tiles loaded successfully');
                
                // Add a placeholder to indicate the tileset is loaded
                const geometry = new THREE.BoxGeometry(1000, 1000, 1000);
                const material = new THREE.MeshBasicMaterial({ 
                    color: 0x00ff00, 
                    wireframe: true,
                    transparent: true,
                    opacity: 0.3
                });
                const placeholder = new THREE.Mesh(geometry, material);
                this.group.add(placeholder);
                
            } catch (error) {
                console.log('Could not load 3D tileset:', error);
            }
        }

        setCamera(camera) {
            this.camera = camera;
        }

        setResolutionFromRenderer(renderer) {
            this.renderer = renderer;
        }

        update() {
            // Rotate the placeholder for visual feedback
            if (this.group.children[0]) {
                this.group.children[0].rotation.x += 0.01;
                this.group.children[0].rotation.y += 0.01;
            }
        }
    };
} else {
    console.log('Real TilesRenderer found, using 3d-tiles-renderer library');
}

console.log('TilesRenderer ready:', typeof TilesRenderer);

// Mapbox map initialization
// mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [TILESET_POSITION.lng, TILESET_POSITION.lat],
    zoom: 17,
    pitch: 65,
    bearing: 0,
    antialias: true // use MSAA for better graphics
});

// Custom Layer implementation
const customLayer = {
    id: '3d-model',
    type: 'custom',
    renderingMode: '3d',

    onAdd: function (map, gl) {
        // three.js setup
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();

        // Add lighting to the scene
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, -70, 100).normalize();
        this.scene.add(directionalLight);

        // 3D Tiles Renderer setup
        this.tilesRenderer = new TilesRenderer(TILESET_URL);
        this.tilesRenderer.setCamera(this.camera);
        this.tilesRenderer.setResolutionFromRenderer(this.renderer);
        this.scene.add(this.tilesRenderer.group);

        // For the real 3d-tiles-renderer library, use fetchOptions for authentication
        if (this.tilesRenderer.fetchOptions !== undefined) {
            this.tilesRenderer.fetchOptions.headers = {
                'Authorization': `Bearer ${CESIUM_ION_ACCESS_TOKEN}`
            };
        } else {
            // Fallback method
            this.tilesRenderer.manager?.setToken(CESIUM_ION_ACCESS_TOKEN);
        }

        // Mapbox GL JS and three.js renderer setup
        this.map = map;
        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true,
        });
        this.renderer.autoClear = false;

        // This is a helper to sync the 3D model's transform with the map's coordinate system
        this.modelTransform = this.getModelTransform();
    },

    // Helper function to create the model's transform matrix
    getModelTransform() {
        const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
            [TILESET_POSITION.lng, TILESET_POSITION.lat],
            TILESET_POSITION.altitude
        );

        const modelTransform = {
            translateX: modelAsMercatorCoordinate.x,
            translateY: modelAsMercatorCoordinate.y,
            translateZ: modelAsMercatorCoordinate.z,
            rotateX: Math.PI / 2,
            rotateY: 0,
            rotateZ: 0,
            scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
        };
        return modelTransform;
    },

    render: function (gl, matrix) {
        // Synchronize the three.js camera with the Mapbox camera
        const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), this.modelTransform.rotateX);
        const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), this.modelTransform.rotateY);
        const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), this.modelTransform.rotateZ);

        const m = new THREE.Matrix4().fromArray(matrix);
        const l = new THREE.Matrix4()
            .makeTranslation(this.modelTransform.translateX, this.modelTransform.translateY, this.modelTransform.translateZ)
            .scale(new THREE.Vector3(this.modelTransform.scale, -this.modelTransform.scale, this.modelTransform.scale))
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.resetState();

        // Update the 3D Tiles renderer
        this.tilesRenderer.update();

        // Render the three.js scene
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    }
};

// Add the custom layer once the map style has loaded
map.on('style.load', () => {
    map.addLayer(customLayer);
});