let isMouseDown = false;

document.body.onmousedown = function () {
    isMouseDown = true;
};

document.body.onmouseup = function () {
    isMouseDown = false;
};

function crearMatrices() {
    const size = document.getElementById("size").value;
    generarMatriz('matriz1', size);
    generarMatriz('matriz2', size);
    generarMatriz('matriz3', size);
}

function descargarSTL() {
    fetch('static/output.stl')
        .then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'output.stl';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Error al descargar el STL:', error));
}

function generarMatriz(matrizId, size) {
    const matrizDiv = document.getElementById(matrizId);
    matrizDiv.innerHTML = '';

    for (let i = 0; i < size; i++) {
        const fila = document.createElement('div');
        fila.classList.add('fila');

        for (let j = 0; j < size; j++) {
            const cuadro = document.createElement('div');
            cuadro.classList.add('cuadro');
            cuadro.dataset.checked = 'true';

            cuadro.addEventListener('mousedown', function () {
                toggleCuadro(cuadro);
            });

            cuadro.addEventListener('mouseover', function () {
                if (isMouseDown) {
                    toggleCuadro(cuadro);
                }
            });

            fila.appendChild(cuadro);
        }
        matrizDiv.appendChild(fila);
    }
}

function toggleCuadro(cuadro) {
    if (cuadro.dataset.checked === 'true') {
        cuadro.dataset.checked = 'false';
        cuadro.classList.add('checked');
    } else {
        cuadro.dataset.checked = 'true';
        cuadro.classList.remove('checked');
    }
}

function enviarDatos() {
    const size = document.getElementById("size").value;
    const matriz1 = obtenerMatriz('matriz1', size);
    const matriz2 = obtenerMatriz('matriz2', size);
    const matriz3 = obtenerMatriz('matriz3', size);

    fetch('/procesar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            size: size,
            matriz1: matriz1,
            matriz2: matriz2,
            matriz3: matriz3
        })
    })
    .then(response => response.json())
    .then(data => {
        cargarSTL();
    })
    .catch(error => console.error('Error:', error));
}

function obtenerMatriz(matrizId, size) {
    const matriz = [];
    const filas = document.querySelectorAll(`#${matrizId} .fila`);
    filas.forEach(fila => {
        const filaMatriz = [];
        fila.querySelectorAll('.cuadro').forEach(cuadro => {
            filaMatriz.push(cuadro.dataset.checked === 'true');
        });
        matriz.push(filaMatriz);
    });
    return matriz;
}

function cargarSTL() {
    const viewer = document.getElementById('viewer');
    viewer.innerHTML = '';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, viewer.clientWidth / viewer.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
    viewer.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    const loader = new THREE.STLLoader();
    loader.load('/static/output.stl', function (geometry) {
        const material = new THREE.MeshNormalMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        camera.position.z = 5;

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableZoom = true;

        animate();

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
    });
}
