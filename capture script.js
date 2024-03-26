document.addEventListener("DOMContentLoaded", function(event) {
    const video = document.getElementById('video');
    const instruction = document.getElementById('instruction');
    const captureButton = document.getElementById('captureButton');
    const sidesList = document.getElementById('sidesList');

    let snapshots = [];
    let currentSide = 0;
    const sides = ['front', 'left', 'right', 'up', 'down']; // Sides of the face to capture

    captureButton.addEventListener('click', function() {
        captureAllSides();
    });

    function captureAllSides() {
        captureSide();
        setTimeout(stopCapturing, 5000); // Stop capturing after 5 seconds
    }

    function stopCapturing() {
        console.log("Stopped capturing after 5 seconds");
        console.log("Captured images of all sides:", snapshots);
        displaySidesStatus(); // Display captured sides dynamically
    }

    async function captureSide() {
        if (currentSide >= sides.length) {
            return;
        }

        instruction.textContent = `Turn your head ${sides[currentSide]}`;
        
        const snapshot = await takeSnapshot();
        snapshots.push({ side: sides[currentSide], image: snapshot });
        currentSide++;

        if (currentSide < sides.length) {
            captureSide(); // Move to the next side
        }
    }

    async function takeSnapshot() {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg');
        return dataURL;
    }

    function displaySidesStatus() {
        sidesList.innerHTML = ''; // Clear previous status

        for (const side of sides) {
            const captured = snapshots.some(snapshot => snapshot.side === side);
            const listItem = document.createElement('li');
            listItem.textContent = `${side}: ${captured ? 'Captured' : 'Missing'}`;
            sidesList.appendChild(listItem);
        }
    }

    function stopCapturing() {
        console.log("Stopped capturing after 5 seconds");
        console.log("Captured images of all sides:", snapshots);
    
        // Perform face detection on the captured images
        Promise.all(snapshots.map(snapshot => detectFaces(snapshot.image)))
            .then(results => {
                console.log("Face detection results:", results);
                displaySidesStatus(results); // Display status with face detection results
            })
            .catch(error => {
                console.error("Error detecting faces:", error);
            });
    }

    // Initialize face-api.js and load models
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./face-api'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
]).then(startCapturing).catch(error => {
    console.error("Error loading face detection models:", error);
});

function startCapturing() {
    // This function starts capturing images and processing them
    // It can include the logic to start capturing images from the video stream and process them using face-api.js
}

// Other parts of your code for capturing images and processing them

    async function detectFaces(imageData) {
        const img = await faceapi.fetchImage(imageData);
        const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
        return detections.length > 0;
    }
    

    // Start the video stream
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            video.srcObject = stream;
        })
        .catch(function(err) {
            console.error("Error accessing the camera: " + err);
        });
});
