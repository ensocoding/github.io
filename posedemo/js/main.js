/**
 *  main.js 
 *  POSE DEMO
 *  This is a proof of concept about how to read the body language from postures using AI,
 *  and it is intended to be applied in the field of security and video survillance. 
 *  Having a body language detection tool can help in the operation of a security monitoring center.
 *  It can detect highly risky situacions with severe consecuences in the security of people and goods.
 *  Such situations may not be easily detected by human operators without a strong expertise in the field.
 *  
 *  In concrete, it is a JS library that extracts human postures from images and scores them 
 *  into 7 mental state classes according to some body language signals (open, close, dominant, aggresive, fearly, etc.). 
 *  - Model One is the PoseNet Tensorflow model, used to extract 17 joint of each posture
 *  - Model Two is a Keras Softmax classifier, used to score each posture mapped to 7 mental clases 
 *  - It also draws all the skeletons in scaled dimensions, and show the predicted mental scores in bar charts
 *  
 *  @author (c) 2021 EnsoCoding
 *  @license GPL-2.0
 *     
 *  Copyright (C) 2021 EnsoCoding
 *  
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *  
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *  
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *  
 */
"use strict";

console.log("Version 0.9.1 - Deploy 07/06 13:57");

/**
 * Model setup
 */
const poseElements = 20;
const scaled_dmax = 150;
const inputSize = 513;
// spanish version
const poseClasses = {
    0: 'NC',
    1: 'ASUSTADO',
    2: 'TENSO',
    3: 'CERRADO',
    4: 'NEUTRAL',
    5: 'ABIERTO',
    6: 'DOMINANTE',
    7: 'AGRESIVO'
};
/* english version
const poseClasses = {
    0: 'NC',
    1: 'AFRAID',
    2: 'STRESSED',
    3: 'CLOSED',
    4: 'NEUTRAL',
    5: 'OPEN',
    6: 'DOMINANT',
    7: 'AGGRESSIVE'
}; */
var classifier = null;
var opacity = 0.5;
var minPoseConfidence = 0.2;
var modelConfiguration = {
    //architecture: 'ResNet50',
    architecture: 'MobileNetV1',
    inputResolution: inputSize,
    /* 
    inputResolution: {
        width: inputSize,
        height: inputSize
    }, 
    */
    decodingMethod: 'multi-person',
    //decodingMethod: 'single-person',

    //outputStride: 8,
    outputStride: 16,
    //outputStride: 32,

    //multiplier: 1.0,
    multiplier: 0.75,
    //multiplier: 0.50,

    //quantBytes: 4,
    quantBytes: 2,
    //quantBytes: 1,

    flipHorizontal: false,
    maxDetections: poseElements,
    scoreThreshold: 0.1,
    nmsRadius: 20
};

/**
 * Canvas setup
 */
const imageElement = document.getElementById('image');
const imageCanvas = document.getElementById('image-canvas');
const poselistElement = document.getElementById('pose-message');
const poselistContainer = document.getElementById('pose-list');
const poseDataContainer = document.getElementById('pose-data');
const ctx = imageCanvas.getContext('2d');

/**
 * HTML elements setup
 */
const imageSelector = document.getElementById('image-selector');
const opacitySelector = document.getElementById('opacity-selector');
const opacityDefault = 0.5;
const opacityOptions = [
    { value: 0.0, label: '0%' },
    { value: 0.25, label: '25%' },
    { value: 0.5, label: '50%' },
    { value: 0.75, label: '75%' },
    { value: 1.0, label: '100%' }
];
const scoreSelector = document.getElementById('score-selector');
const scoreDefault = 0.1;
const scoreOptions = [
    { value: 0.0, label: '0%' },
    { value: 0.01, label: '1%' },
    { value: 0.02, label: '2%' },
    { value: 0.03, label: '3%' },
    { value: 0.04, label: '4%' },
    { value: 0.05, label: '5%' },
    { value: 0.1, label: '10%' },
    { value: 0.15, label: '15%' },
    { value: 0.2, label: '20%' },
    { value: 0.25, label: '25%' },
    { value: 0.3, label: '30%' },
    { value: 0.35, label: '35%' },
    { value: 0.4, label: '40%' },
    { value: 0.45, label: '45%' },
    { value: 0.5, label: '50%' },
    { value: 0.55, label: '55%' },
    { value: 0.6, label: '60%' },
    { value: 0.7, label: '70%' },
    { value: 0.8, label: '80%' },
    { value: 0.9, label: '90%' },
    { value: 1.0, label: '100%' }
];
const confidenceSelector = document.getElementById('confidence-selector');
const confidenceDefault = 0.2;
const confidenceOptions = [
    { value: 0.0, label: '0%' },
    { value: 0.01, label: '1%' },
    { value: 0.02, label: '2%' },
    { value: 0.03, label: '3%' },
    { value: 0.04, label: '4%' },
    { value: 0.05, label: '5%' },
    { value: 0.1, label: '10%' },
    { value: 0.15, label: '15%' },
    { value: 0.2, label: '20%' },
    { value: 0.25, label: '25%' },
    { value: 0.3, label: '30%' },
    { value: 0.35, label: '35%' },
    { value: 0.4, label: '40%' },
    { value: 0.45, label: '45%' },
    { value: 0.5, label: '50%' },
    { value: 0.55, label: '55%' },
    { value: 0.6, label: '60%' },
    { value: 0.7, label: '70%' },
    { value: 0.8, label: '80%' },
    { value: 0.9, label: '90%' },
    { value: 1.0, label: '100%' }
];
const posesButton = document.getElementById('poses-button');
const datosButton = document.getElementById('datos-button');

/**
 * Event Listeners  
 */
opacitySelector.addEventListener('change', () => {
    changeOpacity(opacitySelector.value)
});
scoreSelector.addEventListener('change', () => {
    changeScore(scoreSelector.value)
});
confidenceSelector.addEventListener('change', () => {
    changeConfidence(confidenceSelector.value)
});
posesButton.addEventListener('click', () => {
    poselistContainer.style.display = 'block';
    poseDataContainer.style.display = 'none';
});
datosButton.addEventListener('click', () => {
    poselistContainer.style.display = 'none';
    poseDataContainer.style.display = 'block';
});
imageSelector.addEventListener('change', () => {
    changeImage(imageSelector.value)
});

/**
 * Apend a selector options
 * @param {*} selector 
 * @param {*} options 
 * @param {*} optdefault 
 */
function addSelectorOptions(selector, options, optdefault) {
    let len = options.length;
    for (let i = 0; i < len; i++) {
        let opt = document.createElement('option');
        opt.value = options[i].value;
        if (optdefault == opt.value) {
            opt.selected = true;
        }
        opt.innerHTML = options[i].label;
        selector.appendChild(opt);
    }
}

/**
 * Append all selector's options  
 */
function appendOptions() {
    addSelectorOptions(opacitySelector, opacityOptions, opacityDefault);
    addSelectorOptions(scoreSelector, scoreOptions, scoreDefault);
    addSelectorOptions(confidenceSelector, confidenceOptions, confidenceDefault);
};
appendOptions();

/**
 * Used only if fileupload is enabled.
 * Change the image file by choosing one from the upload folder 
 * @param {*} fileobject 
 */
function changeFileImage(fileobject) {
    try {
        var file = 'uploads/' + fileobject.files[0].name;
        document.getElementById('image').src = file;
        console.log(file);
        ctx.clearRect(0, 0, imageElement.width, imageElement.height);
        setTimeout(() => {
            modelOneExtractPostures();
        }, 500);
    } catch {
        console.log('ERROR: Image not loaded');
    }
}

/**
 * Change the image by selecting another file from the select image element
 * @param {*} image 
 */
async function changeImage(image) {
    document.getElementById('image').src = image;
    ctx.clearRect(0, 0, imageElement.width, imageElement.height);
    await modelOneExtractPostures();
    //setTimeout(() => {   }, 500);
}

/**
 * Reload the current selected image
 */
async function reloadImage() {
    ctx.clearRect(0, 0, imageElement.width, imageElement.height);
    await modelOneExtractPostures();
    //setTimeout(() => {   }, 500);
}

/**
 * Change the opacity of the skeleton overlay
 * @param {*} alpha 
 */
function changeOpacity(alpha) {
    opacity = alpha;
    ctx.clearRect(0, 0, imageElement.width, imageElement.height);
    setTimeout(() => {
        modelOneExtractPostures();
    }, 100);
}

/**
 * Change the score threshold of the model join detection feature
 * @param {*} score 
 */
function changeScore(score) {
    modelConfiguration.scoreThreshold = score;
    ctx.clearRect(0, 0, imageElement.width, imageElement.height);
    setTimeout(() => {
        modelOneExtractPostures();
    }, 100);
}

/**
 * Change the confidence threshold of the model posture detection feature
 * @param {*} confidence 
 */
function changeConfidence(confidence) {
    minPoseConfidence = confidence;
    ctx.clearRect(0, 0, imageElement.width, imageElement.height);
    setTimeout(() => {
        modelOneExtractPostures();
    }, 100);
}

/**
 * Just draw the skeleton overlay at a given opacity
 * @param {*} opacity 
 */
function fillCanvasOverlay(opacity) {
    ctx.clearRect(0, 0, imageElement.width, imageElement.height);
    ctx.fillStyle = 'black';
    // apply opacity of the overlay
    ctx.globalAlpha = opacity;
    ctx.fillRect(0, 0, imageElement.width, imageElement.height);
    // restore opacity prior to draw keypoint
    ctx.globalAlpha = 1.0;
}

/**
 * Draw the skeleton for all postures and return the scaled and normalized posture data array
 * @param {*} poses 
 * @param {*} minPoseConfidence 
 * @returns array poses_n
 */
function drawSkeleton(poses, minPoseConfidence) {

    // normalized pose convertions (square-scaled from 0 to 1)
    let poses_n = [];
    for (let i = 0; i < poses.length; i++) {
        // For each pose detected, loop through all the keypoints
        let pose = poses[i];
        if (pose.score >= minPoseConfidence) {

            // get the 17 keypoints by part
            // BODY KEYPOINTS PARTS
            // 0:	nose
            // 1:	leftEye
            // 2:	rightEye
            // 3:	leftEar
            // 4:	rightEar
            // 5:	leftShoulder
            // 6:	rightShoulder
            // 7:	leftElbow
            // 8:	rightElbow
            // 9:	leftWrist
            // 10:	rightWrist
            // 11:	leftHip
            // 12:	rightHip
            // 13:	leftKnee
            // 14:	rightKnee
            // 15:	leftAnkle
            // 16:	rightAnkle

            let x_nose = pose.keypoints[0].position.x;
            let y_nose = pose.keypoints[0].position.y;

            // 1 - left points, 2 - right point
            let x1_eye = pose.keypoints[1].position.x;
            let y1_eye = pose.keypoints[1].position.y;
            let x2_eye = pose.keypoints[2].position.x;
            let y2_eye = pose.keypoints[2].position.y;

            let x1_ear = pose.keypoints[3].position.x;
            let y1_ear = pose.keypoints[3].position.y;
            let x2_ear = pose.keypoints[4].position.x;
            let y2_ear = pose.keypoints[4].position.y;

            let x1_shoul = pose.keypoints[5].position.x;
            let y1_shoul = pose.keypoints[5].position.y;
            let x2_shoul = pose.keypoints[6].position.x;
            let y2_shoul = pose.keypoints[6].position.y;

            let x1_elbow = pose.keypoints[7].position.x;
            let y1_elbow = pose.keypoints[7].position.y;
            let x2_elbow = pose.keypoints[8].position.x;
            let y2_elbow = pose.keypoints[8].position.y;

            let x1_wrist = pose.keypoints[9].position.x;
            let y1_wrist = pose.keypoints[9].position.y;
            let x2_wrist = pose.keypoints[10].position.x;
            let y2_wrist = pose.keypoints[10].position.y;

            let x1_hip = pose.keypoints[11].position.x;
            let y1_hip = pose.keypoints[11].position.y;
            let x2_hip = pose.keypoints[12].position.x;
            let y2_hip = pose.keypoints[12].position.y;

            let x1_knee = pose.keypoints[13].position.x;
            let y1_knee = pose.keypoints[13].position.y;
            let x2_knee = pose.keypoints[14].position.x;
            let y2_knee = pose.keypoints[14].position.y;

            let x1_ankle = pose.keypoints[15].position.x;
            let y1_ankle = pose.keypoints[15].position.y;
            let x2_ankle = pose.keypoints[16].position.x;
            let y2_ankle = pose.keypoints[16].position.y;

            // synthetic points
            let x_mid_ear;
            let y_mid_ear;
            let x_mid_shoul;
            let y_mid_shoul;
            let x_mid_hip;
            let y_mid_hip;
            if (x1_ear < x2_ear) {
                x_mid_ear = Math.round(x1_ear + Math.sqrt(((x1_ear - x2_ear) / 2) ** 2));
            } else {
                x_mid_ear = Math.round(x2_ear + Math.sqrt(((x1_ear - x2_ear) / 2) ** 2));
            }
            if (y1_ear < y2_ear) {
                y_mid_ear = Math.round(y1_ear + Math.sqrt(((y1_ear - y2_ear) / 2) ** 2));
            } else {
                y_mid_ear = Math.round(y2_ear + Math.sqrt(((y1_ear - y2_ear) / 2) ** 2));
            }
            if (x1_shoul < x2_shoul) {
                x_mid_shoul = Math.round(x1_shoul + Math.sqrt(((x1_shoul - x2_shoul) / 2) ** 2));
            } else {
                x_mid_shoul = Math.round(x2_shoul + Math.sqrt(((x1_shoul - x2_shoul) / 2) ** 2));
            }
            if (y1_shoul < y2_shoul) {
                y_mid_shoul = Math.round(y1_shoul + Math.sqrt(((y1_shoul - y2_shoul) / 2) ** 2));
            } else {
                y_mid_shoul = Math.round(y2_shoul + Math.sqrt(((y1_shoul - y2_shoul) / 2) ** 2));
            }
            if (x1_hip < x2_hip) {
                x_mid_hip = Math.round(x1_hip + Math.sqrt(((x1_hip - x2_hip) / 2) ** 2));
            } else {
                x_mid_hip = Math.round(x2_hip + Math.sqrt(((x1_hip - x2_hip) / 2) ** 2));
            }
            if (y1_hip < y2_hip) {
                y_mid_hip = Math.round(y1_hip + Math.sqrt(((y1_hip - y2_hip) / 2) ** 2));
            } else {
                y_mid_hip = Math.round(y2_hip + Math.sqrt(((y1_hip - y2_hip) / 2) ** 2));
            }

            // START DRAWING
            // draw the center of the head
            let size = 15;
            ctx.beginPath();
            ctx.arc(x_mid_ear, y_mid_ear, size, 0, 2 * Math.PI);
            ctx.fillStyle = 'green';
            ctx.fill();

            // draw the left half 
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(Math.round(x_nose), Math.round(y_nose));
            ctx.lineTo(Math.round(x1_eye), Math.round(y1_eye));
            ctx.lineTo(Math.round(x1_ear), Math.round(y1_ear));
            ctx.lineTo(Math.round(x_mid_shoul), Math.round(y_mid_shoul));
            ctx.lineTo(Math.round(x1_shoul), Math.round(y1_shoul));
            ctx.lineTo(Math.round(x1_elbow), Math.round(y1_elbow));
            ctx.lineTo(Math.round(x1_wrist), Math.round(y1_wrist));
            ctx.stroke();
            ctx.moveTo(Math.round(x_mid_shoul), Math.round(y_mid_shoul));
            ctx.lineTo(Math.round(x_mid_hip), Math.round(y_mid_hip));
            ctx.lineTo(Math.round(x1_hip), Math.round(y1_hip));
            ctx.lineTo(Math.round(x1_knee), Math.round(y1_knee));
            ctx.lineTo(Math.round(x1_ankle), Math.round(y1_ankle));
            ctx.stroke();
            // draw the right half 
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'blue';
            ctx.beginPath();
            ctx.moveTo(Math.round(x_nose), Math.round(y_nose));
            ctx.lineTo(Math.round(x2_eye), Math.round(y2_eye));
            ctx.lineTo(Math.round(x2_ear), Math.round(y2_ear));
            ctx.lineTo(Math.round(x_mid_shoul), Math.round(y_mid_shoul));
            ctx.lineTo(Math.round(x2_shoul), Math.round(y2_shoul));
            ctx.lineTo(Math.round(x2_elbow), Math.round(y2_elbow));
            ctx.lineTo(Math.round(x2_wrist), Math.round(y2_wrist));
            ctx.stroke();
            ctx.moveTo(Math.round(x_mid_shoul), Math.round(y_mid_shoul));
            ctx.lineTo(Math.round(x_mid_hip), Math.round(y_mid_hip));
            ctx.lineTo(Math.round(x2_hip), Math.round(y2_hip));
            ctx.lineTo(Math.round(x2_knee), Math.round(y2_knee));
            ctx.lineTo(Math.round(x2_ankle), Math.round(y2_ankle));
            ctx.stroke();

            // draw the label
            ctx.textWidth = 1;
            ctx.font = 'normal normal normal 14px sans-serif';
            ctx.strokeStyle = 'white';
            ctx.strokeText(i + 1, x_nose - 5, y_nose - 20);

            // initialize max min detectors (inverted)
            let x_min = 513;
            let y_min = 513;
            let x_max = 0;
            let y_max = 0;
            // draw the keypoints
            for (let j = 0; j < pose.keypoints.length; j++) {
                let keypoint = pose.keypoints[j];
                let x = keypoint.position.x;
                let y = keypoint.position.y;
                let part = keypoint.part;
                let size = 3;
                let color = 'blue';
                // select color by part name
                if (part == 'nose') {
                    color = 'yellow';
                    size = 10
                }
                // left body color
                if (part.startsWith('left')) {
                    color = 'red';
                }
                // right body color
                if (part.startsWith('right')) {
                    color = 'blue';
                }
                // draw each point
                ctx.beginPath();
                ctx.arc(x, y, size, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
                //console.log(part + " (x, y): ( " + Math.round(x) + ", " + Math.round(y) + ") ");
                // detect min pose x, y
                if (x < x_min) {
                    x_min = x;
                }
                if (y < y_min) {
                    y_min = y;
                }
                // detect max pose x, y
                if (x > x_max) {
                    x_max = x;
                }
                if (y > y_max) {
                    y_max = y;
                }
            }
            // detect dx, dy, d_max (bounding box side)
            let dx = x_max - x_min;
            let dy = y_max - y_min;
            let d_max = dx;
            if (dy > dx) {
                d_max = dy;
            }
            // draw the clipping squared box with dimensions at: x_min, y_min, d_max, d_max
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'darkgray';
            ctx.strokeRect(x_min, y_min, d_max, d_max);
            //console.log("box 3d: " + i + ": ( " + x_min + ", " + y_min + ", " + d_max + " ) ");
            // END DRAWING

            // generate scaled poses
            let keypoints_n = [];
            for (let k = 0; k < pose.keypoints.length; k++) {
                let keypoint = pose.keypoints[k];
                let xn = (keypoint.position.x - x_min) / d_max;
                let yn = (keypoint.position.y - y_min) / d_max;
                let part = keypoint.part;
                let keypoint_n = {
                    'part': part,
                    'xn': xn,
                    'yn': yn
                }
                keypoints_n.push(keypoint_n);
            }
            poses_n.push({
                'pose_id': i + 1,
                'scaled_keypoints': keypoints_n
            });
            // } else {
            // minConfidence not reached, but not used yet
        }
    }
    return poses_n;
}

/**
 * Draw the pose list with a scaled canvas and a scored bar graph for all detected postures, 
 * and return the unscaled array data 
 * @param {*} scaledlist 
 * @param {*} dmax 
 * @returns array poses_u
 */
function drawScaledPoseList(scaledlist, dmax) {

    // title of the scaled poses list
    let title = document.createElement('div');
    title.className = 'pose-data-title';
    title.innerHTML = 'Poses detectadas en la escena:';
    poselistContainer.appendChild(title);

    // unscaled pose convertions (from 0-1 to square-scaled)
    let poses_u = [];
    for (let i = 0; i < scaledlist.length; i++) {
        let pose_id = scaledlist[i].pose_id;
        let ctxn;
        // extract scaled poses skeleton ...

        // keypoints have 17 scaled points of one pose
        let keypoints = scaledlist[i].scaled_keypoints;
        // get unscaled keypoints (x, y * dmax)
        let x_nose = keypoints[0].xn * dmax;
        let y_nose = keypoints[0].yn * dmax;

        // unscaled points: 1 - left points, 2 - right point
        let x1_eye = keypoints[1].xn * dmax;
        let y1_eye = keypoints[1].yn * dmax;
        let x2_eye = keypoints[2].xn * dmax;
        let y2_eye = keypoints[2].yn * dmax;

        let x1_ear = keypoints[3].xn * dmax;
        let y1_ear = keypoints[3].yn * dmax;
        let x2_ear = keypoints[4].xn * dmax;
        let y2_ear = keypoints[4].yn * dmax;

        let x1_shoul = keypoints[5].xn * dmax;
        let y1_shoul = keypoints[5].yn * dmax;
        let x2_shoul = keypoints[6].xn * dmax;
        let y2_shoul = keypoints[6].yn * dmax;

        let x1_elbow = keypoints[7].xn * dmax;
        let y1_elbow = keypoints[7].yn * dmax;
        let x2_elbow = keypoints[8].xn * dmax;
        let y2_elbow = keypoints[8].yn * dmax;

        let x1_wrist = keypoints[9].xn * dmax;
        let y1_wrist = keypoints[9].yn * dmax;
        let x2_wrist = keypoints[10].xn * dmax;
        let y2_wrist = keypoints[10].yn * dmax;

        let x1_hip = keypoints[11].xn * dmax;
        let y1_hip = keypoints[11].yn * dmax;
        let x2_hip = keypoints[12].xn * dmax;
        let y2_hip = keypoints[12].yn * dmax;

        let x1_knee = keypoints[13].xn * dmax;
        let y1_knee = keypoints[13].yn * dmax;
        let x2_knee = keypoints[14].xn * dmax;
        let y2_knee = keypoints[14].yn * dmax;

        let x1_ankle = keypoints[15].xn * dmax;
        let y1_ankle = keypoints[15].yn * dmax;
        let x2_ankle = keypoints[16].xn * dmax;
        let y2_ankle = keypoints[16].yn * dmax;

        // preprocessing poseData to predict poseClass
        let xPoseData = [];
        // x0 - x16
        for (let i = 0; i < 17; i++) {
            xPoseData.push(keypoints[i].xn);
        }
        // y0 - y16
        for (let i = 0; i < 17; i++) {
            xPoseData.push(keypoints[i].yn);
        }
        // GET posture CLASSFIED HERE
        let xPoseClasses = modelTwoClassifyPostures(xPoseData);

        // create pose list elements
        try {
            // generate each row of the scaled pose list
            /*  
            Javascript generated HTML pose list element
            <div id='pose-div-1' class="pose-div" style="display: none;">
                <canvas id='pose-can-1' class='pose-canvas'></canvas>
                <div id='pose-txt-1'>
                Pose #
                <hr class="pose-separator">
                    <div class="pose-class">
                        <div class="pose-class-name">ASUSTADO</div>
                        <div class="pose-class-predic">1 %</div>
                        <div class="pose-class-bar" style="width: 1px;"></div>
                    </div>
                    :                
                </div>
            </div>
            */
            let canvas = document.createElement('canvas');
            canvas.id = 'pose-can-' + pose_id;
            canvas.className = 'pose-canvas';
            canvas.width = dmax;
            canvas.height = dmax;
            let text = document.createElement('div');
            text.innerHTML = "Pose # <b>" + pose_id + '</b><hr class="pose-separator">';
            text.id = 'pose-txt-' + pose_id;
            text.className = 'pose-label';
            let div = document.createElement('div');
            div.id = 'pose-div-' + pose_id;
            div.className = 'pose-div';
            //            let hr = document.createElement('hr');
            // add pose clasifications        
            let class_div = [];
            for (let i = 1; i < 8; i++) {
                class_div[i] = document.createElement('div');
                let pose_class = document.createElement('div');
                let pose_predic = document.createElement('div');
                let pose_bar = document.createElement('div');
                pose_class.className = 'pose-class-name';
                pose_class.innerHTML = printPoseClasses(i, false);
                pose_predic.className = 'pose-class-predic';
                pose_predic.innerHTML = Math.round(xPoseClasses[i]) + ' %';
                pose_bar.className = 'pose-class-bar';
                let bar_position = Math.round(xPoseClasses[i]);
                pose_bar.style.width = bar_position + 'px';
                class_div[i].className = 'pose-class';
                class_div[i].appendChild(pose_class);
                class_div[i].appendChild(pose_predic);
                class_div[i].appendChild(pose_bar);
                text.appendChild(class_div[i]);
            }
            //            div.appendChild(hr);
            div.appendChild(canvas);
            div.appendChild(text);
            poselistContainer.appendChild(div);
            canvas.style.display = 'inline';
            div.style.display = 'block';

            // pose canvas context
            ctxn = canvas.getContext('2d');

        } catch (e) {
            console.log("error :" + e);
            return;
        }

        // synthetic unscaled points
        let x_mid_ear;
        let y_mid_ear;
        let x_mid_shoul;
        let y_mid_shoul;
        let x_mid_hip;
        let y_mid_hip;
        if (x1_ear < x2_ear) {
            x_mid_ear = Math.round(x1_ear + Math.sqrt(((x1_ear - x2_ear) / 2) ** 2));
        } else {
            x_mid_ear = Math.round(x2_ear + Math.sqrt(((x1_ear - x2_ear) / 2) ** 2));
        }
        if (y1_ear < y2_ear) {
            y_mid_ear = Math.round(y1_ear + Math.sqrt(((y1_ear - y2_ear) / 2) ** 2));
        } else {
            y_mid_ear = Math.round(y2_ear + Math.sqrt(((y1_ear - y2_ear) / 2) ** 2));
        }
        if (x1_shoul < x2_shoul) {
            x_mid_shoul = Math.round(x1_shoul + Math.sqrt(((x1_shoul - x2_shoul) / 2) ** 2));
        } else {
            x_mid_shoul = Math.round(x2_shoul + Math.sqrt(((x1_shoul - x2_shoul) / 2) ** 2));
        }
        if (y1_shoul < y2_shoul) {
            y_mid_shoul = Math.round(y1_shoul + Math.sqrt(((y1_shoul - y2_shoul) / 2) ** 2));
        } else {
            y_mid_shoul = Math.round(y2_shoul + Math.sqrt(((y1_shoul - y2_shoul) / 2) ** 2));
        }
        if (x1_hip < x2_hip) {
            x_mid_hip = Math.round(x1_hip + Math.sqrt(((x1_hip - x2_hip) / 2) ** 2));
        } else {
            x_mid_hip = Math.round(x2_hip + Math.sqrt(((x1_hip - x2_hip) / 2) ** 2));
        }
        if (y1_hip < y2_hip) {
            y_mid_hip = Math.round(y1_hip + Math.sqrt(((y1_hip - y2_hip) / 2) ** 2));
        } else {
            y_mid_hip = Math.round(y2_hip + Math.sqrt(((y1_hip - y2_hip) / 2) ** 2));
        }

        // START DRAWING
        // clear scaled canvas (not really needed, but ...)
        ctxn.beginPath();
        ctxn.fillStyle = 'black';
        ctxn.globalAlpha = 1.0;
        ctxn.fillRect(0, 0, dmax, dmax);
        ctxn.fill();

        // draw the head first
        let size = scaled_dmax / 10;
        let color = 'green';
        ctxn.beginPath();
        ctxn.fillStyle = color;
        ctxn.arc(x_mid_ear, y_mid_ear, size, 0, 2 * Math.PI);
        ctxn.fill();
        // draw the left half 
        ctxn.lineWidth = 2;
        ctxn.strokeStyle = 'red';
        ctxn.beginPath();
        ctxn.moveTo(Math.round(x_nose), Math.round(y_nose));
        ctxn.lineTo(Math.round(x1_eye), Math.round(y1_eye));
        ctxn.lineTo(Math.round(x1_ear), Math.round(y1_ear));
        ctxn.lineTo(Math.round(x_mid_shoul), Math.round(y_mid_shoul));
        ctxn.lineTo(Math.round(x1_shoul), Math.round(y1_shoul));
        ctxn.lineTo(Math.round(x1_elbow), Math.round(y1_elbow));
        ctxn.lineTo(Math.round(x1_wrist), Math.round(y1_wrist));
        ctxn.stroke();
        ctxn.moveTo(Math.round(x_mid_shoul), Math.round(y_mid_shoul));
        ctxn.lineTo(Math.round(x_mid_hip), Math.round(y_mid_hip));
        ctxn.lineTo(Math.round(x1_hip), Math.round(y1_hip));
        ctxn.lineTo(Math.round(x1_knee), Math.round(y1_knee));
        ctxn.lineTo(Math.round(x1_ankle), Math.round(y1_ankle));
        ctxn.stroke();
        // draw the right half 
        ctxn.lineWidth = 2;
        ctxn.strokeStyle = 'blue';
        ctxn.beginPath();
        ctxn.moveTo(Math.round(x_nose), Math.round(y_nose));
        ctxn.lineTo(Math.round(x2_eye), Math.round(y2_eye));
        ctxn.lineTo(Math.round(x2_ear), Math.round(y2_ear));
        ctxn.lineTo(Math.round(x_mid_shoul), Math.round(y_mid_shoul));
        ctxn.lineTo(Math.round(x2_shoul), Math.round(y2_shoul));
        ctxn.lineTo(Math.round(x2_elbow), Math.round(y2_elbow));
        ctxn.lineTo(Math.round(x2_wrist), Math.round(y2_wrist));
        ctxn.stroke();
        ctxn.moveTo(Math.round(x_mid_shoul), Math.round(y_mid_shoul));
        ctxn.lineTo(Math.round(x_mid_hip), Math.round(y_mid_hip));
        ctxn.lineTo(Math.round(x2_hip), Math.round(y2_hip));
        ctxn.lineTo(Math.round(x2_knee), Math.round(y2_knee));
        ctxn.lineTo(Math.round(x2_ankle), Math.round(y2_ankle));
        ctxn.stroke();

        // draw all the other points, colored by side
        for (let k = 0; k < keypoints.length; k++) {
            let x = keypoints[k].xn * dmax;
            let y = keypoints[k].yn * dmax;
            let part = keypoints[k].part;
            size = 3;
            color = 'blue';
            // select color by part name
            if (part == 'nose') {
                color = 'yellow';
            }
            // left body color
            if (part.startsWith('left')) {
                color = 'red';
            }
            // right body color
            if (part.startsWith('right')) {
                color = 'blue';
            }
            // draw each point
            ctxn.beginPath();
            ctxn.fillStyle = color;
            ctxn.arc(x, y, size, 0, 2 * Math.PI);
            ctxn.fill();
        }
        // END DRAWING
        // generate unscaled poses
        let keypoints_u = [];
        for (let k = 0; k < keypoints.length; k++) {
            let xu = keypoints[k].xn * dmax;
            let yu = keypoints[k].yn * dmax;
            let part = keypoints[k].part;
            let keypoint_u = {
                'part': part,
                'xu': xu,
                'yu': yu
            }
            keypoints_u.push(keypoint_u);
        }
        poses_u.push({
            'pose_id': pose_id,
            'unscaled_keypoints': keypoints_u
        });
    }
    return poses_u;
}

/**
 * Draw the DATOS table with all the postures data and return it as HTML
 * @param {*} scaledData 
 * @returns string html
 */
function drawScaledPoseData(scaledData) {
    let html = '';
    html += '<div class="pose-data-title">Datos num&eacute;ricos de las poses:</div>';
    html += '<table class="pose-data-tb">' + "\n";
    html += '<tr class="pose-data-tb-header">' + "\n";
    html += '<td width="20px"><b>PID</b></td>' + "\n";
    html += '<td width="60px"><b>Part</b></td>' + "\n";
    html += '<td width="20px"><b>KP</b></td>' + "\n";
    html += '<td width="200px"><b>X Pos</b></td>' + "\n";
    html += '<td width="200px"><b>Y Pos</b></td>' + "\n";
    html += '</tr>' + "\n";
    let len_p = scaledData.length;
    for (let p = 0; p < len_p; p++) {
        // traverse pose
        let poseid = scaledData[p].pose_id;
        let scaledpoint = scaledData[p].scaled_keypoints;
        let len_k = scaledpoint.length;
        for (let k = 0; k < len_k; k++) {
            // traverse keypoints of the pose and generate each record
            let part = scaledpoint[k].part;
            let x_pos = scaledpoint[k].xn;
            let y_pos = scaledpoint[k].yn;
            html += '<tr>' + "\n";
            html += '<td width="20px">' + poseid + '</td>';
            html += '<td width="60px">' + part + '</td>';
            html += '<td width="20px">' + k + '</td>';
            html += '<td width="200px">' + x_pos + '</td>';
            html += '<td width="200px">' + y_pos + '</td>';
            html += '</tr>' + "\n";
        }
    }
    html += '</table>' + "\n";
    return html;

}

/**
 * TensorFlow JS Model 1 Detector PoseNet
 * Load the model One as a promise. 
 * Then estimate the poses from the given imageElement and using the modelConfiguration.
 * After the promise is resolved, draw all the updated elements on the screen  
 */
async function modelOneExtractPostures() {
    await loadClassifierModel();

    poselistElement.innerHTML = "Loading PoseNet .. ";
    console.log('Loading Detector PoseNet ... ');
    posenet.load(

    ).then(
        function(net) {
            console.log('Detector PoseNet Loaded.');
            poselistElement.innerHTML = "Predicting ... ";
            // estimate and return poses
            //return net.estimatePoses(imageElement, modelConfiguration)
            return net.estimateMultiplePoses(imageElement, modelConfiguration)
        }
    ).then(

        function(poses) {
            if (poses.length < 1) {
                // show end message
                poselistElement.innerHTML = "Poses not detected. Try again.";
                return;
            }
            poselistElement.innerHTML = "Drawing ... ";

            // clean scaled pose list and data ...
            poselistContainer.innerHTML = '';
            poseDataContainer.innerHTML = '';

            // overlay the image so the point get more visible
            fillCanvasOverlay(opacity);
            // poses is the returned array with the prediction score and keypoints
            console.log(poses);
            // draw the points
            let scaledPoses = drawSkeleton(poses, minPoseConfidence);

            // print scaledPoses. 
            // This array stores normalized coordinates (scaled fron 0 to 1) of every 
            // detected pose returned fron drawSkeleton
            // It will be used as an input of a custom second model to clasify each posture
            console.log("Scaled Poses ");
            console.log(scaledPoses);

            // generate scaled pose data ...
            poseDataContainer.innerHTML = drawScaledPoseData(scaledPoses);
            // show scaled pose list
            let unScaledPoses = drawScaledPoseList(scaledPoses, scaled_dmax);

            console.log("UnScaled Poses ");
            console.log(unScaledPoses);

            // show end message
            poselistElement.innerHTML = "Done. ";
        }
    );
}


/**
 * TensorFlow JS Model 2  Keras Softmax Classifier
 * Load the model Two as a promise.
 */
async function loadClassifierModel() {
    console.log('Loading Classifier ...');
    classifier = await tf.loadLayersModel('./classifier/model.json', { strict: false });
    //model_loaded = true;
    console.log('Classifier Loaded.');
    //classifier.summary();
}

/**
 * TensorFlow JS Model 2  Keras Softmax Classifier
 * Classify the given posture data and return the scores for each class as an array
 * @param {*} xPoseData 
 * @returns array xPoseClasses
 */
function modelTwoClassifyPostures(xPoseData) {
    try {
        let xPoseTensorData = tf.tensor2d(xPoseData, [1, 34]);
        // OK model accepts the tensor shaped data and do a prediction. 
        const pred = classifier.predict(xPoseTensorData, { batchSize: 1 });
        //console.log(pred.print());
        const pred_sync = pred.dataSync();
        //console.log(pred_sync);
        let xPoseClasses = {
            1: pred_sync[1] * 100,
            2: pred_sync[2] * 100,
            3: pred_sync[3] * 100,
            4: pred_sync[4] * 100,
            5: pred_sync[5] * 100,
            6: pred_sync[6] * 100,
            7: pred_sync[7] * 100,
        };
        for (let i = 1; i < 8; i++) {
            //if (xPoseClasses[i] < 1) {
            // strip values too small
            //xPoseClasses[i] = 0.01;
            //}
            console.log(printPoseClasses(i, false) + ': ' + Math.round(xPoseClasses[i]) + '%');
        }
        return xPoseClasses;

    } catch (e) {
        console.log("CLASSIFIER ERROR: " + e);
    }
}

/**
 * Just map the classnbr to each classname and return it, or print it on the console
 * @param {*} classnbr 
 * @param {*} debug 
 * @returns string poseClasses[classnbr]
 */
function printPoseClasses(classnbr = 0, debug = false) {
    if (debug) {
        if (classnbr == 0 || typeof classnbr === 'undefined') {
            for (let i = 0; i < 8; i++) {
                console.log('CLASS ' + i + ': ' + poseClasses[i]);
            }
            return;
        }
        console.log('CLASS ' + classnbr + ': ' + poseClasses[classnbr]);
        return;
    }
    return poseClasses[classnbr];
}