// ==========================================================================
// ProjectPulse AI - Three.js 3D Digital Twin Visualization
// Interactive Spatial Node Mesh & PM Gati Shakti National Infrastructure Grid
// ==========================================================================

class InfraTwin3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.nodesGroup = null;
    this.linesGroup = null;
    this.particlesGroup = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactiveNodes = [];
    this.tooltip = document.getElementById("node-tooltip");
    this.isRotating = true;
    this.rotationSpeed = 0.003;
    
    // Mouse drag interaction
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070b14, 0.002);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    this.camera.position.set(0, 30, 180);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(50, 100, 50);
    this.scene.add(dirLight);

    // Build 3D Entities
    this.buildGlobeWireframe();
    this.buildParticleField();
    this.buildInfrastructureNodes();
    this.buildCorridorArcs();

    // Event Listeners
    this.setupEventListeners();

    // Start Render Loop
    this.animate();
  }

  buildGlobeWireframe() {
    // Holographic digital twin core sphere
    const sphereGeo = new THREE.SphereGeometry(65, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    this.globe = new THREE.Mesh(sphereGeo, sphereMat);
    this.scene.add(this.globe);

    // Inner glowing aura
    const innerGeo = new THREE.SphereGeometry(63, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0369a1,
      transparent: true,
      opacity: 0.08
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    this.globe.add(innerSphere);
  }

  buildParticleField() {
    const particleCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 350;
      positions[i + 1] = (Math.random() - 0.5) * 250;
      positions[i + 2] = (Math.random() - 0.5) * 350;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 1.5,
      transparent: true,
      opacity: 0.35
    });

    this.particlesGroup = new THREE.Points(geometry, material);
    this.scene.add(this.particlesGroup);
  }

  latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  buildInfrastructureNodes() {
    this.nodesGroup = new THREE.Group();
    this.globe.add(this.nodesGroup);

    // Get key flagship projects from dataset
    const projects = window.PAIMANA_DATASET ? window.PAIMANA_DATASET.slice(0, 35) : [];

    projects.forEach((proj) => {
      const coords = proj.coordinates || { lat: 20, lng: 78 };
      const pos = this.latLngToVector3(coords.lat, coords.lng, 66);

      // Node color based on AI risk
      const risk = proj.ai ? proj.ai.compositeRiskScore : 50;
      let colorHex = 0x10b981; // Safe Green
      let glowHex = 0x34d399;

      if (risk >= 75) {
        colorHex = 0xef4444; // Critical Red
        glowHex = 0xf87171;
      } else if (risk >= 45) {
        colorHex = 0xf59e0b; // Amber Warning
        glowHex = 0xfbbf24;
      }

      // Core Node Pin
      const pinGeo = new THREE.SphereGeometry(1.4, 16, 16);
      const pinMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.7,
        roughness: 0.2
      });
      const nodeMesh = new THREE.Mesh(pinGeo, pinMat);
      nodeMesh.position.copy(pos);
      nodeMesh.userData = { project: proj };

      // Pulsing Halo Ring
      const ringGeo = new THREE.RingGeometry(1.8, 2.5, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: glowHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(0, 0, 0);

      this.nodesGroup.add(nodeMesh);
      this.nodesGroup.add(ringMesh);
      this.interactiveNodes.push(nodeMesh);
    });
  }

  buildCorridorArcs() {
    this.linesGroup = new THREE.Group();
    this.globe.add(this.linesGroup);

    // Connect top nodal pairs with energy arcs
    for (let i = 0; i < this.interactiveNodes.length - 1; i += 2) {
      const start = this.interactiveNodes[i].position;
      const end = this.interactiveNodes[i + 1].position;

      // Arc curve
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(75); // elevate curve

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(30);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
        linewidth: 1
      });

      const line = new THREE.Line(geometry, material);
      this.linesGroup.add(line);
    }
  }

  setupEventListeners() {
    const el = this.renderer.domElement;

    // Mouse drag rotation
    el.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.globe.rotation.y += deltaX * 0.006;
        this.globe.rotation.x += deltaY * 0.006;

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      this.checkIntersection(e.clientX, e.clientY);
    });

    // Node click selection
    el.addEventListener("click", () => {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveNodes);
      if (intersects.length > 0) {
        const proj = intersects[0].object.userData.project;
        if (proj && window.AppController) {
          window.AppController.selectProject(proj.id);
        }
      }
    });

    // Window Resize
    window.addEventListener("resize", () => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  checkIntersection(screenX, screenY) {
    if (!this.tooltip) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveNodes);

    if (intersects.length > 0) {
      const proj = intersects[0].object.userData.project;
      if (proj) {
        this.tooltip.style.display = "block";
        this.tooltip.style.left = `${screenX + 15}px`;
        this.tooltip.style.top = `${screenY + 15}px`;
        
        const riskScore = proj.ai ? proj.ai.compositeRiskScore : 50;
        const riskColor = riskScore >= 75 ? "text-red-400" : riskScore >= 45 ? "text-amber-400" : "text-emerald-400";

        this.tooltip.innerHTML = `
          <div class="glass-panel p-3 rounded-lg border border-sky-400/30 text-xs shadow-xl min-w-[220px]">
            <div class="font-bold text-sky-300 mb-1 truncate">${proj.name}</div>
            <div class="text-slate-300">${proj.agency} | ₹${proj.revisedCost} Cr</div>
            <div class="mt-2 flex items-center justify-between border-t border-slate-700/60 pt-1.5">
              <span class="text-slate-400">Risk Score:</span>
              <span class="font-bold ${riskColor}">${riskScore}/100</span>
            </div>
            <div class="text-[10px] text-sky-400 mt-1">Click to inspect in Decision Studio ↗</div>
          </div>
        `;
        document.body.style.cursor = "pointer";
        return;
      }
    }

    this.tooltip.style.display = "none";
    document.body.style.cursor = "default";
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Slow atmospheric rotation when not dragging
    if (this.isRotating && !this.isDragging && this.globe) {
      this.globe.rotation.y += this.rotationSpeed;
    }

    // Gentle particle drift
    if (this.particlesGroup) {
      this.particlesGroup.rotation.y -= 0.0008;
    }

    this.renderer.render(this.scene, this.camera);
  }

  toggleRotation() {
    this.isRotating = !this.isRotating;
    return this.isRotating;
  }

  resetCamera() {
    this.globe.rotation.set(0, 0, 0);
    this.camera.position.set(0, 30, 180);
  }
}

window.InfraTwin3D = InfraTwin3D;
