/**
 *   VICKY 2.0.1
 *   The voice-chatbot trial  
 *
 *   BOTLIBRE AVATAR 3D ANIMADO + IBM WATSON ASSISTANT BACK-END
 *   -----------------------------------------------------------------------------------------------------------------
 *   Capacidades básicas:
 *   + Escucha el mensaje, lo transcribe a texto español e interactúa con el servidor de Watson Assistant
 *   + Se conecta con botlibre.com y muestra un avatar 3D animado que habla y expresa emociones básicas
 *   + Integra en una sola página RWD una interfaz para bot libre y un frame que carga el preview de Watson (modo texto)
 *   + Contiene los elementos básicos que permiten la experiencia de una videollamada realista
 *   + MODO GPT para asistente virtual de consultas complejas
 * 
 *   @see https://www.botlibre.com
 *   @see https://cloud.ibm.com/catalog/services/watson-assistant
 *   @author (c) EnsoCoding 2020
 *   -----------------------------------------------------------------------------------------------------------------
 */
/*
//  -----------------------------------------------------------------------------------------------------------------
TODO LIST:
Future improvements
    + TO-FIX: Voice recognition on Android should not overlap voice text to speech audio while it's playing.    
*/
// ------------------------------------------------------------------------- //
//	DECLARACION DE VARIABLES
// ------------------------------------------------------------------------- //

/**
 * Datos para control del avatar 
 */
const LOCAL_JS = "./js/sdk.js";
const REMOT_JS = "./js/sdk.js"; // aplicar el local, que está modificado para operar con vicky
//const REMOT_JS = "https://www.botlibre.com/scripts/sdk.js";
const CSS_PATH = './css/';

// chat control
var chatgpt_on = false;
var avatar_avail = true;
var avatar_chang = true;
var chatVisible = false;
var hiddenVideo = false;
var serverError = false;
var call_active = false;
var volume_loud = true;
var loop_Speech = false;
var loop_Speech_ms = 4000;
var screenTheme = 'light'; // ligh mode default
var inimsg = 'Hola!. ¿En que puedo ayudarte?'; // offline default greeting
var recognition;

/**
 * Lang configurations
 */
var lang_selected = "sp"; // español default
var lang_native_option = 2 // native selected option (only apply for spanish lang) 
var lang_native_voice = true; // default initAvatar config
//  1 = responsive voice native option
var lang_native_1_code = "es";
var lang_native_1_name = "Spanish Latin American Female"; // español tipo Google
//  2 = HTML5 native option (doesn't work on Android Chrome)
var lang_native_2_code = "es-AR";
var lang_native_2_name = "Microsoft Laura - Spanish (Spain)"; // español normal
//var lang_native_2_name = "Microsoft Helena Desktop - Spanish (Spain)"; // español grave

/**
 * WATSON ASSISTANT API V2 END POINT 
 */
var apiKey = "NNx5LAhOS7N3kMyX4DfVyZFfAwzOAFqyznqDW__It0YA";
var authBasic = "YXBpa2V5Ok5OeDVMQWhPUzdOM2tNeVg0RGZWeVpGZkF3ek9BRnF5em5xRFdfX0l0MFlB";
var asistId = "b7cde16e-d722-4528-8829-f6d4603de5d6";
// var baseUrl = "https://api.us-south.assistant.watson.cloud.ibm.com/instances/58b2c424-cce2-40a9-a69d-6abaeeb0c746";
// stateless route
// var postRouteSLess = "/v2/assistants/" + asistId + "/message?version=2020-04-01"
// WATSON PREVIEW API END POINT 
// error CORS
// var baseUrl = "https://assistant-chat-us-south.watsonplatform.net";
// var postRouteSLess = "/public/message/87aeaa50-cde9-4a52-830d-a57afe0e99d1?version=2020-09-24"

var baseUrl = "https://integrations.us-south.assistant.watson.appdomain.cloud";
var postRouteSLess = "/public/chat/87aeaa50-cde9-4a52-830d-a57afe0e99d1/message?version=2021-11-27";


/**
 * Bot Libre Avatar configuration
 */
const SDK_APPLICATION_ID = "44982303877927990";
const SDK_DEBUG = true;
const rotate_avatar_1 = "14097430"; // Victoria Business (at job)
const rotate_avatar_2 = "14097447"; // Victoria Casual  (at home)
var rotate_selected = "14097430";  // Victoria Business
var emotion = "happy";
var action = "";
var web;
var sdk;

/**
 * Chat GPT cofig
 */
//var apikeygpt = '';  // GIT repo must not have apikeys commited !!
var apikeygpt = '';
var baseUrl_gpt = "https://api.openai.com";
var resource_gpt = "/v1/chat/completions";
var lang_gpt_prompt = "In spanish.";
var gpt_org = "org-G9oQFgbpUJ6YuQYPVk4IW7fF";

// Open AI model version's availability 
//var gpt_model = "gpt-3.5-turbo";
var gpt_model = "gpt-3.5-turbo-instruct";
//var gpt_model = "gpt-3.5-turbo-0125";
//var gpt_model = "gpt-3.5-turbo-16k-0613";
//var gpt_model = "gpt-3.5-turbo-0613"
//var gpt_model = "gpt-3.5-turbo-1106"

/**
 * variables de session Watson que deben persistir entre requests
 */
var data_thread_id = "main";
var data_thread_status = null;
var data_id = "5e761384-9399-4f07-bef9-cb493d9fa7dd";
var data_request_id = null;
var data_session_id = "56578419-822b-4edc-9380-1d7c84d3a954";
// context.global.system
var data_timezone = "America/Buenos_Aires";
var data_user_id = "anonymous_IBMuid-612afd8d-5ca0-463d-9b78-61513c2335b6";
var data_turn_count = 1;
// context.skills."main skill".system.state
var data_system_state = {};

/** 
 * Mandatos de voz
 */
const VOICE_COMMAND_DROPCALL_1 = 'GRACIAS';
const VOICE_COMMAND_DROPCALL_2 = 'ADIÓS';
const VOICE_COMMAND_DROPCALL_3 = 'HASTA PRONTO';
const VOICE_COMMAND_HELLOWORLD = 'CIBER';
const VOICE_COMMAND_STOPCALL_1 = 'CORTAR';
const VOICE_COMMAND_MANUALMODE = 'MANUAL';
const VOICE_COMMAND_ONLINEMODE = 'VIDEO';
const VOICE_COMMAND_GODARKMODE = 'OSCURO';
const VOICE_COMMAND_GOLIGHMODE = 'CLARO';
const VOICE_COMMAND_LOCATEHOME = 'EN CASA';
const VOICE_COMMAND_LOCATE_JOB = 'TRABAJO';
const VOICE_COMMAND_LOCATE_LIC = 'LICENCIA';
const VOICE_COMMAND_LANGUAG_ES = 'ESPAÑOL';
const VOICE_COMMAND_LANGUAG_IT = 'ITALIANO';
const VOICE_COMMAND_LANGUAG_EN = 'INGLÉS';
const VOICE_COMMAND_LANGUAG_SP = 'SPANISH';
const VOICE_COMMAND_VHISTORIAL = 'PANTALLA';
const VOICE_COMMAND_RELOADPAGE = 'REINICIAR';
const VOICE_COMMAND_REPORTHELP = 'MANDATOS';
const VOICE_COMMAND_CHAT_GPT35 = 'ASISTENTE';

/**
 * Mensajes e imagenes predefinidos
 */
const AVATAR_FACE = '<img src="./img/avatar_big.png" height="180px">'; // victoria image (at licence)
const AVATAR_ICON = '<img src="./img/avatar.png" height="35px">&nbsp;&nbsp;';
const USERPE_ICON = '<img src="./img/userpe.png" height="35px">&nbsp;&nbsp;';
const TITLE_ONLINE = 'Victoria Online';
const TITLE_OFFLINE = 'Victoria Offline';
const MSG_BYE = 'Un gusto ayudarte. hasta pronto !!';
const MSG_OUT = 'Estoy fuera de la oficina hasta mañana. <br>Responderé tus mensajes a través de Watson. Gracias!';
const MSG_INIT_1 = 'Bienvenido. Gracias por comunicarte.';
const MSG_INIT_2 = '¿Como va todo?';
const MSG_EN_TRABAJO = 'Ahora estoy en la oficina, just in time';
const MSG_EN_CASA = 'Ahora estoy en casa, Guau!, muy poco tráfico hoy';
const MSG_EN_ESPANIOL = 'Excelente, ahora te hablo en Español neutro. Si no puedes oirme, pasa al italiano, que es el <b>IT</b> que le sigue.';
const MSG_EN_ITALIANO = 'ora parlo Italiano e me la cavo con lo spagnolo come posso. Scusa.';
const MSG_EN_INGLES = "I am speaking to you in English now. Amazing. But I'm sorry for my Spanish, it's awful.";
const MSG_EN_SPANISH = "Ahora te hablo Español de España. Sólo puedes usarlo en navegadores de escritorio. Cambia al siguiente <b>ES</b> si estás en un móvil Android o no podrás escucharme!";
// mensajes de error
const MSG_ERROR_NET = 'No hay conexion a internet, intenta recargar la página. Ojalá que lo resuelvas pronto.';
const MSG_ERROR_SDK_POST = '¡Ouch!. No hay comunicacion con Botlibre. ¿Tenés internet activada?. Mientras lo resuelves, estaré de licencia. ¡Avísame por favor!';
const MSG_ERROR_SDK_API = '¡Ouppps! Ya llegamos al límite de 500 llamadas a la API de Botlibre. Me voy de licencia, hasta mañana.';
const MSG_ERROR_POST_RESPONSE = 'Respuesta indefinida del servidor. El requerimiento puede estar mal formado o el servidor cambió algo';
const MSG_ERROR_AJAX_REQUEST = 'Error de conexion con el servidor. Puede ser una falla de red o la URL está mal formada';
const MSG_ERROR_GPT_REQUEST = 'No se puede obtener la respuesta por falla de red o URL mal formada';
const MSG_ERROR_GPT_QUOTA = 'No se puede obtener la respuesta por cuota excedida (429 too many requests)';
const MSG_ERROR_WATSON_CONNECT_TO_AGENT_RESPONSE = '¿What? ¿Are you speaking in english?. No tengo ní idea. Por favor intenta otra opción.';
const MSG_ERROR_WATSON_CONFUSED_SUGGESTION_RESPONSE = 'No me queda claro qué es lo que necesitas. Puedes consultar la ayuda para ver las opciones posibles.';

// ------------------------------------------------------------------------- //
//	INICIALIACION
// ------------------------------------------------------------------------- //

/**
	Funcion autoejecutable de inicializacion al recargar la página
	* lee el texto en la caja online
	* reconoce la voz si se activa el microfono
	* inicia el avatar
*/
const chat = function() {
    try {
        $(document).ready(function() {
            scrollTop();
            $("#chat").keypress(function(event) {
                if (event.which == 13) {
                    event.preventDefault();
                    addRequest($("#chat").val());
                    //startTalking();
                    send();
                }
            });
            $("#rec").click(function(event) {
                switchRecognition();
            });
            if (avatar_avail) {
                //startTalking();
            }

        });
        // inicia loop si está activado por config
        if (loop_Speech) {
            startLoopRecognition();
        }
    } catch {
        addHistory(MSG_ERROR_NET);
    }
}();

// ------------------------------------------------------------------------- //
//	CONTROLES DE NAVEGACION Y PANTALLA
// ------------------------------------------------------------------------- //
/**
	Recarga de página por comando de voz
*/
function reloadPage() {
    window.top.blur();
    window.self.focus();
    window.history.go(0);
}

/**
	Alterna mostrar video o no segun el boton de chat/video
*/
function toggleVideoHidding() {
    var html = '';
    hiddenVideo = !hiddenVideo;
    if (hiddenVideo) {
        hideVideoScreen();
        html += '<a href="#" onclick="toggleVideoHidding()" class="topbar-buttons-color">';
        html += '<i class="material-icons">ondemand_video</i>&nbsp;Video</a>';
    } else {
        showVideoScreen();
        html += '<a href="#" onclick="toggleVideoHidding()" class="topbar-buttons-color">';
        html += '<i class="material-icons">question_answer</i>&nbsp;Chat</a>';
    }
    document.getElementById('video-hidding-button').innerHTML = html;
}

/**
	Hace visible el panel de video y controles asociados
*/
function showVideoScreen() {
    // mostrar paneles de video y controles
    document.getElementById("video-hidding-panels").style.display = "block";
    // posicionar correctamente al mostrar el video
    window.scrollBy(0, 0);
    chatVisible = true;
    toggleChattingRooms();
}
/**
	Hace invisible el panel de video y controles asociados
*/
function hideVideoScreen() {
    // ocultar paneles de video y controles
    document.getElementById("video-hidding-panels").style.display = "none";
    // posicionar correctamente al ocultar el video
    window.scrollBy(0, 0);
    chatVisible = true;
    toggleChattingRooms();
}
/**
 *  Scroll the page to the top.  Daaaaa!
 */
function scrollTop() {
    window.self.focus();
    window.scrollTo(0, 0);
}
/**
	Alterna entre llamada online y chat con watson
*/
function toggleChattingRooms() {
    if (chatVisible) {
        document.getElementById("watson-preview-div").style.display = "none";
        document.getElementById("chatear-label").innerHTML = "Chatear en Watson";
        document.getElementById("online-video-div").style.display = "block";
        document.getElementById("online-call-div").style.display = "block";
        if (avatar_avail) {
            document.getElementById('outoffice-div').innerHTML = "";
            document.getElementById('online-title').innerHTML = TITLE_ONLINE;
            //document.getElementById('online-div').style.display = "block";
        } else {
            renderOutOffice();
        }
        //startLoopRecognition();
    } else {
        document.getElementById("watson-preview-div").style.display = "block";
        document.getElementById("online-video-div").style.display = "none";
        document.getElementById("online-call-div").style.display = "none";
        document.getElementById("chatear-label").innerHTML = "Llamada Online";
        if (avatar_avail) {
            document.getElementById('outoffice-div').innerHTML = "";
            document.getElementById('online-title').innerHTML = TITLE_ONLINE;
            //document.getElementById('online-div').style.display = "none";
        }
        //stopLoopRecognition();
    }
    // toggle ready to the next iteration
    chatVisible = !chatVisible;
}
/**
    Hace visible la imagen de fuera de oficina y leyenda de LICENCIA
    siempre que exista una llamada activa, sino no porque se superpone con los botones expandidos
*/
function renderOutOffice() {
    if (call_active) {
        // out message
        document.getElementById("outoffice-div").style.display = "block";
        document.getElementById('outoffice-div').innerHTML = AVATAR_FACE + '<br>' + MSG_OUT;;
        document.getElementById('online-title').innerHTML = TITLE_OFFLINE;
        document.getElementById('avatar-location').innerHTML = "LICENCIA";
        // ocultar video screen
        document.getElementById('online-div').style.display = "none";
    }
}

/**
	Sale de watson y va a llamada online
*/
function startChatting() {
    chatVisible = false;
    toggleChattingRooms();
}
/**
	Dibuja y actualiza los botones de la barra de llamar/cortar
*/
function renderCallButtons(startcall) {
    let callhtml = '';
    // hold the state of any call for future checking
    call_active = startcall;
    //-- DIV llamar --//
    callhtml += '<div style="display: flex; width: 320px; margin-top: 10px;">';
    // Boton de llamar/cortar 
    if (startcall) {
        document.getElementById('header-image').style.display = 'none';
        document.getElementById('llamar').style.height = '51px';
        callhtml += '<div style=" width: 160px; padding: 0px 10px;">';
        callhtml += '<a href="#" class="red-text" onclick="stopTalking()">';
        callhtml += '<i class="material-icons">call_end</i>&nbsp;&nbsp;Cortar</a>';
    } else {
        document.getElementById('header-image').style.display = 'block';
        document.getElementById('llamar').style.height = '281px';
        callhtml += '<div style=" width: 160px; padding: 0px 10px;">';
        callhtml += '<a href="#" class="red-text" onclick="startTalking()">';
        callhtml += '<i class="material-icons">call</i>&nbsp;&nbsp;Llamar</a>';
    }
    callhtml += '</div>';

    if (startcall) {
        // Botones auxiliares compactos
        callhtml += '<div style="width: 80px; padding: 0px 20px 0px 0px; font-size: 12px;">';
        callhtml += '<a href="#" class="red-text" onclick="setInput(' + "'version'" + ')">';
        callhtml += '<i class="material-icons">info_outline</i>VER&nbsp;&nbsp;</a>';
        callhtml += '</div>';
        callhtml += '<div style="width: 80px; padding: 0px 20px 0px 0px; font-size: 12px;">';
        callhtml += '<a href="#" class="red-text" onclick="setInput(' + "'vicky'" + ')">';
        callhtml += '<i class="material-icons">face</i>HEY&nbsp;&nbsp;</a>';
        callhtml += '</div>';
        callhtml += '<div style="width: 80px; padding: 0px 20px 0px 0px; font-size: 12px;">';
        callhtml += '<a href="#" class="red-text" onclick="setInput(' + "'ayuda'" + ')">';
        callhtml += '<i class="material-icons">help</i>HELP&nbsp;</a>';
        callhtml += '</div>';
        callhtml += '<div style="width: 80px; padding: 0px 20px 0px 0px; font-size: 12px;">';
        callhtml += '<a href="#" class="blue-text" onclick="rotateGPT()">';
        callhtml += '<i class="material-icons">face</i>GPT&nbsp;</a>';
        callhtml += '</div>';
        callhtml += '<div style="width: 50px;; padding: 0px 20px 0px 0px; font-size: 12px;">';
        callhtml += '</div>';
        // END DIV llamar
        callhtml += '</div>';
    } else {
        // END DIV llamar primero
        callhtml += '</div>';
        // Botones auxiliares expandidos cuando no hay llamada
        callhtml += '<div style="width: 100%; padding: 0px 10px;">&nbsp;';
        callhtml += '</div>';
        callhtml += '<div style="width: 100%; padding: 0px 10px;">';
        callhtml += '<a href="#" class="red-text" onclick="setInput(' + "'version'" + ')">';
        callhtml += '<i class="material-icons">info_outline</i>&nbsp;&nbsp;';
        callhtml += '<span style="font-size: 12px">VER&nbsp;</span>: Acerca de</a>';
        callhtml += '</div>';
        callhtml += '<div style="width: 100%; padding: 0px 10px;">';
        callhtml += '<a href="#" class="red-text" onclick="setInput(' + "'vicky'" + ')">';
        callhtml += '<i class="material-icons">face</i>&nbsp;&nbsp;';
        callhtml += '<span style="font-size: 12px">HEY&nbsp;</span>: Confirmar presencia / Interrumpir</a>';
        callhtml += '</div>';
        callhtml += '<div style="width: 100%; padding: 0px 10px;">';
        callhtml += '<a href="#" class="red-text" onclick="setInput(' + "'ayuda'" + ')">';
        callhtml += '<i class="material-icons">help</i>&nbsp;&nbsp;';
        callhtml += '<span style="font-size: 12px">HELP&nbsp;&nbsp;</span>: Menú de Opciones</a>';
        callhtml += '</div>';
    }
    return callhtml;
}
/**
	Permite una llamada cuando el avatar esta offline, si watson está disponible
*/
function initOfflineCall() {
    addHistory(MSG_OUT);
    renderOutOffice();
    document.getElementById('llamar').innerHTML = renderCallButtons(true);
}
/**
	Pone el avatar offline. Medida de contingencia cuando botlibre esta inaccesible
*/
function setAvatarOffline() {
    try {
        document.getElementById('botlibre-sdk').src = LOCAL_JS;
    } catch {}
    avatar_avail = false;
    initOfflineCall();
}
/**
	Pone el avatar online. Contramedida de contingencia, para restaurar la operacion del avatar
*/
function setAvatarOnline() {
    try {
        document.getElementById('botlibre-sdk').src = REMOT_JS;
    } catch {}
    avatar_avail = true;
    // ocultar out-office screen
    document.getElementById("outoffice-div").style.display = "none";
    // restore video panels
    if (rotate_selected == rotate_avatar_2) {
        document.getElementById('online-title').innerHTML = TITLE_ONLINE + ' | En casa';
    } else {
        document.getElementById('online-title').innerHTML = TITLE_ONLINE + ' | En la oficina';
    }
    document.getElementById('online-div').style.display = "block";
    document.getElementById('llamar').innerHTML = renderCallButtons(true);
}
/**
	Carrousel que cambia de avatar a TRABAJO, CASA, LICENCIA en esa secuencia
*/
function rotateAvatarLocation(where) {
    if (typeof where === 'undefined' || where == null) {
        // rotate avatar
        if (avatar_avail) {
            if (rotate_selected == rotate_avatar_1) {
                rotate_selected = rotate_avatar_2;
                avatar_avail = true
            } else {
                avatar_avail = false;
            }
        } else {
            rotate_selected = rotate_avatar_1;
            avatar_avail = true;
        }
        console.log('Avatar rotated: ' + rotate_selected + ', ' + avatar_avail);
    } else {
        // select specified avatar o go to licence by defaul
        switch (where) {
            case 'TRABAJO':
                rotate_selected = rotate_avatar_1;
                avatar_avail = true;
                break;
            case 'CASA':
                rotate_selected = rotate_avatar_2;
                avatar_avail = true;
                break;
            default:
                rotate_selected = rotate_avatar_2;
                avatar_avail = false;
        }

    }

    // process avatar selection
    if (avatar_avail) {
        let text;
        let emot;
        if (rotate_selected == rotate_avatar_1) {
            document.getElementById('avatar-location').innerHTML = "TRABAJO";
            inimsg = MSG_INIT_1;
            text = MSG_EN_TRABAJO;
            emot = "happy";

        } else {
            document.getElementById('avatar-location').innerHTML = "CASA";
            inimsg = MSG_INIT_2;
            text = MSG_EN_CASA;
            emot = "surprise";
        }
        addHistory(text);
        setAvatarOnline();
        try {

            //web.avatar = rotate_selected;
            web.avatar = rotate_selected;
            web.updateAvatar();
            web.addMessage(text, emot, "smile", "");
            //web.processMessages();
            processMessages();

        } catch {
            addHistory('El video no está funcionando hoy. Trata de recargar la página.');
        }

    } else {
        addHistory('No estoy disponible en video, hablemos por chat.');
        document.getElementById('avatar-location').innerHTML = "LICENCIA";
        //renderOutOffice();
        setAvatarOffline();
    }

}
/**
	Alterna entre modo oscuro DK DARK y claro LG LIGH
*/
function rotateTheme(theme) {
    let icon;
    let mode;

    if (typeof theme === 'undefined' || theme == null) {
        // rotate theme
        if (screenTheme == 'light') {
            screenTheme = 'dark';
            icon = 'brightness_low';
            mode = 'DK';
        } else {
            screenTheme = 'light';
            icon = 'brightness_high';
            mode = 'LG';
        }
        console.log('THEME rotated: ' + mode);
    } else {
        // preset theme
        switch (theme) {
            case 'OSCURO':
                screenTheme = 'dark';
                icon = 'brightness_low';
                mode = 'DK';
                break;
            default:
                screenTheme = 'light';
                icon = 'brightness_high';
                mode = 'LG';
        }
        console.log('THEME seleted: ' + mode);
    }
    document.getElementById('css-theme').href = CSS_PATH + screenTheme + '.css';
    document.getElementById('screen-theme').innerHTML = icon;
    document.getElementById('screen-mode').innerHTML = mode;
}
/**
	Alterna entre lenguajes ES IT EN SP
*/
function rotateLanguage(lan) {
    let text;
    if (typeof web === 'undefined') {
        startTalking();
    }
    if (typeof lan === 'undefined' || lan == null) {
        // carrousel - funciona siempre que no esté lang definido en la llamada
        if (lang_selected == 'es') {
            lang_selected = 'it';
            text = MSG_EN_ITALIANO;
        } else {
            if (lang_selected == 'it') {
                lang_selected = 'en';
                text = MSG_EN_INGLES;
            } else {
                if (lang_selected == 'en') {
                    lang_selected = 'sp';
                    lang_native_option = 2;
                    text = MSG_EN_SPANISH;
                } else {
                    lang_selected = 'es';
                    lang_native_option = 1;
                    text = MSG_EN_ESPANIOL;
                }
            }
        }
        console.log('LANG rotated: ' + lang_selected);

    } else {
        // preset lang
        switch (lan) {
            case 'ES':
                lang_selected = 'es';
                lang_native_option = 1;
                text = "Pasé a español Neutro. ";
                text += MSG_EN_ESPANIOL;
                break;
            case 'SP':
                lang_selected = 'sp';
                lang_native_option = 2;
                text = "Pasé a español de España. ";
                text += MSG_EN_SPANISH;
                break;
            case 'IT':
                lang_selected = 'it';
                text = "passare all'italiano. ";
                text += MSG_EN_ITALIANO;
                break;
            default:
                lang_selected = 'en';
                text = "i changed to english. ";
                text += MSG_EN_INGLES;
        }
        console.log('LANG selected: ' + lang_selected);
    }
    // solo se impacta si hay avatar activo 
    if (avatar_avail) {

        // try to purge preloaded messages 
        restartAudio();
        // selecciona configuraciones
        if (lang_selected == 'es') {
            // only works on native mode. Not botlibre default ES option
            web.nativeVoice = true;
            if (lang_native_option == 1) {
                // Responsive Voice native option selected
                web.lang = lang_native_1_code;
                console.log('LANG SP NATIVE OPTION 1 SELECTED');
            } else {
                web.lang = 'es';
            }
            web.nativeVoiceName = lang_native_1_name;
            web.responsiveVoice = true;
            try {
                SDK.initResponsiveVoice();
                console.log('LANG ES, SDK Responsive Voice initialized OKAY.');
            } catch {
                console.log('LANG ES, SDK Responsive Voice initialization FAILED.');
            }

        }
        if (lang_selected == 'sp') {
            // only works on native mode. Not botlibre default SP option
            web.nativeVoice = true;
            if (lang_native_option == 2) {
                // HTML5 native option selected
                web.lang = lang_native_2_code;
                console.log('LANG SP NATIVE OPTION 2 SELECTED');
            } else {
                web.lang = 'es';
            }
            web.nativeVoiceName = lang_native_2_name;
            web.responsiveVoice = false;

        }
        if (lang_selected == 'it') {
            web.voice = "istc-lucia-hsmm";
            web.lang = "it";
            web.nativeVoice = false;
        }
        if (lang_selected == 'en') {
            web.voice = "cmu-slt";
            web.lang = "en";
            web.nativeVoice = false;
        }
        // update avatar
        //lang_selected = web.lang; // no hace falta y no quiero que salga ES-AR
        document.getElementById('language').innerHTML = lang_selected.toLocaleUpperCase();
        //web.updateAvatar();
        // prueba el nuevo idioma
        if (lang_selected == 'es') {
            web.addMessage(text, "surprise", "smile", "");
        }
        if (lang_selected == 'sp') {
            web.addMessage(text, "love", "", "smile");
        }
        if (lang_selected == 'it') {
            web.addMessage(text, "anger", "scream", "");
        }
        if (lang_selected == 'en') {
            web.addMessage(text, "sad", "kiss", "");
        }
        //web.processMessages();
        processMessages();

    } else {
        // default, no hay avatar disponible
        console.log('LANG not applied, avatar unavailable: ' + lang_selected);
        //lang_selected = 'es';
    }
    document.getElementById('language').innerHTML = '<b>' + lang_selected.toLocaleUpperCase() + '</b>';
    console.log('Language: ' + lang_selected);
    addHistory(text);
}

/**
 * Rotate GPT MODE on|off
 */
function rotateGPT() {
    if (typeof web === 'undefined') {
        // initAvatar();
        startTalking();
    }
    if(chatgpt_on) { 
        chatgpt_on = false; 
        addHistory('MODO CHAT-GPT OFF');
        web.addMessage('Modo chat gpt desactivado', "crying", "kiss", "");
    } else {
        chatgpt_on = true;
        addHistory('MODO CHAT-GPT ON');
        web.addMessage('Modo chat gpt activado', "happy", "smile", "");
    }
    processMessages();
}
/**
 * Purge any current audio playing and background sounds before changing the language.
 */
function restartAudio() {
    try {
        speechSynthesis.cancel();
        if (typeof SDK.audio !== 'undefined' && SDK.audio != null) {
            SDK.audio.pause();
            SDK.audio = null;
        }
        if (typeof SDK.currentAudio !== 'undefined' && SDK.currentAudio != null) {
            SDK.currentAudio.pause();
            SDK.currentAudio = null;
        }
        if (typeof SDK.currentBackgroundAudio !== 'undefined' && SDK.currentBackgroundAudio != null) {
            SDK.currentBackgroundAudio.pause();
            SDK.currentBackgroundAudio = null;
        }
        if (SDK.responsiveVoice) {
            if (responsiveVoice.isPlaying()) {
                responsiveVoice.cancel();
            }
            SDK.responsiveVoice = false;
        }
        web.lang = '';
        web.nativeVoiceName = '';
        web.nativeVoice = false;
        console.log('LANG SDK Audio Restarted');

    } catch (e) {
        console.log('LANG SDK Audio Restart failed: ' + e);
    }
}

/**
 * Change speaker icon and mute audio is volume goes off
 */
function toggleVolume() {
    if (volume_loud) {
        volumeOff();
    } else {
        volumeUp();
    }
}
/**
 * Mutes and set the volume off icon
 */
function volumeOff() {
    pauseAudio();
    volume_loud = false;
    document.getElementById('volume-button').innerHTML = 'volume_off';
}
/**
 * Set the volume up icon
 */
function volumeUp() {
    resumeAudio();
    volume_loud = true;
    document.getElementById('volume-button').innerHTML = 'volume_up';
}
/**
 * Mute the current playing audio
 */
function pauseAudio() {
    try {
        speechSynthesis.pause();
        if (typeof SDK.audio !== 'undefined' && SDK.audio != null) {
            SDK.audio.pause();
        }
        if (typeof SDK.currentAudio !== 'undefined' && SDK.currentAudio != null) {
            SDK.currentAudio.pause();
        }
        if (typeof SDK.currentBackgroundAudio !== 'undefined' && SDK.currentBackgroundAudio != null) {
            SDK.currentBackgroundAudio.pause();
        }
        if (SDK.responsiveVoice) {
            if (responsiveVoice.isPlaying()) {
                responsiveVoice.pause();
            }
        }
        console.log('AUDIO paused');
    } catch (e) {
        console.log('Audio pause failed: ' + e);
    }
}
/**
 * Resume the muted current playing audio
 */
function resumeAudio() {
    try {
        speechSynthesis.resume();
        if (typeof SDK.audio !== 'undefined' && SDK.audio != null) {
            SDK.audio.resume();
        }
        if (typeof SDK.currentAudio !== 'undefined' && SDK.currentAudio != null) {
            SDK.currentAudio.resume();
        }
        if (typeof SDK.currentBackgroundAudio !== 'undefined' && SDK.currentBackgroundAudio != null) {
            SDK.currentBackgroundAudio.resume();
        }
        if (SDK.responsiveVoice) {
            responsiveVoice.resume();
        }
        console.log('AUDIO resumed');
    } catch (e) {
        console.log('Audio resume failed: ' + e);
    }
}
/**
 * Check if audio is playing right now
 */
function checkAudioIsPlaying() {
    try {
        if (typeof responsiveVoice !== 'undefined' && responsiveVoice != null) {
            if (responsiveVoice.isPlaying()) {
                console.log('CHECK AUDIO; RV  is playing right now ... ');
                return true;
            }
        }
        /*
        if (typeof SDK.audio !== 'undefined' && SDK.audio != null) {
            console.log('CHECK AUDIO: SDK is playing right now ... ');
            return true;
        }
        */
        if (typeof SDK.currentAudio !== 'undefined' && SDK.currentAudio != null) {
            console.log('CHECK AUDIO; SDK CURR is playing right now ... ');
            return true;
        }
        if (typeof SDK.currentBackgroundAudio !== 'undefined' && SDK.currentBackgroundAudio != null) {
            console.log('CHECK AUDIO: SDK CURR BG is playing right now ... ');
            return true;
        }

    } catch (e) {
        console.log('CHECK AUDIO failed: ' + e);
        return false;
    }
    console.log('CHECK AUDIO: NONE are playing at all');
    return false;
}
// ------------------------------------------------------------------------- //
//	CONTROLES DE CONVERSACION ON EL AVATAR
// ------------------------------------------------------------------------- //

/**
	Comienzo de llamada en video y manejo en caso de avatar no disponible
*/
function startTalking() {
    if (avatar_avail && typeof web === 'undefined') {
        initAvatar();
    }
    SDK.play(SDK.url + '/chime.mp3');
    document.getElementById('llamar').innerHTML = renderCallButtons(true);
    document.getElementById("online-div").style.display = "block";
    //document.getElementById("acciones").style.display = "block";
    //document.getElementById("bot-div").style.display = "block";
    try {
        if (inimsg != '') {
            if (avatar_avail) {
                web.addMessage(inimsg, emotion, action, "");
                //web.processMessages();
                processMessages();
            } else {
                renderOutOffice();
            }
            addHistory(inimsg);
            // esto pasa automaticamente a online
            chatVisible = true;
            toggleChattingRooms();
        }
    } catch {
        addHistory(MSG_OUT);
        // esto pasa automaticamente a watson
        //chatVisible = false;
        //toggleChattingRooms();
    }
    return;
}
/**
	Terminacion de llamada en video, saludo final y manejo en caso de avatar no disponible
*/
function stopTalking() {
    if (avatar_avail) {
        stopLoopRecognition();
        stopRecognition();
        web.addMessage(MSG_BYE, "happy", "", "");
        //web.processMessages();
        processMessages();
    } else {
        renderOutOffice();
    }
    addHistory(MSG_BYE);
    // esto pasa automaticamente a online + video antes de cortar
    chatVisible = true;
    toggleChattingRooms();
    hiddenVideo = true;
    toggleVideoHidding();
    // espera el saludo y oculta la llamada
    setTimeout(() => {
        document.getElementById('online-div').style.display = "none";
        document.getElementById("outoffice-div").style.display = "none";
        document.getElementById('llamar').innerHTML = renderCallButtons(false);
        SDK.play(SDK.url + '/chime.mp3');
    }, 4000);
    return;
}
/**
	Agrega respuesta como historia del avatar
*/
function addHistory(message) {
    if (message != '' && !(typeof message === 'undefined')) {

        //$("#response").html('<b>' + AVATAR_ICON + message + '<b><br>');
        var htmlprev = '';
        // 1. add new message
        htmlprev += '<li style="padding: 5px 8px 0px 0px">';
        htmlprev += '<div style="border-width: 8px; border-style: none none none solid; border-color: red; ';
        htmlprev += 'background: #fff0f0; margin 0 auto; padding: 10px 10px 10px">';
        htmlprev += AVATAR_ICON + message;
        htmlprev += '</div></li>';
        // 2. add previous history
        htmlprev += document.getElementById('response-history').innerHTML;
        // update history
        document.getElementById('response-history').innerHTML = htmlprev;
        console.log('addHistory: ' + message);
        scrollTop();
    }

}
/**
	Agrega requerimiento con historia del usuario
*/
function addRequest(message) {
    if (message != '' && !(typeof message === 'undefined')) {
        var htmlprev = '';
        // 1. add new message
        htmlprev += '<li style="padding: 5px 0px 0px 8px">';
        htmlprev += '<div style="border-width: 8px; border-style: none solid none none; border-color: green; ';
        htmlprev += 'background: #f0fff0; margin 0 auto; padding: 10px 10px 10px;">';
        htmlprev += USERPE_ICON + '<a href="#" class="user-text" onclick="setInput(' + "'" + message + "'" + ')">' + message + '</a>';
        htmlprev += '</div></li>';
        // 2. add previous history
        htmlprev += document.getElementById('response-history').innerHTML;
        // update history
        document.getElementById('response-history').innerHTML = htmlprev;
        // change call buttons state
        document.getElementById('llamar').innerHTML = renderCallButtons(true);
        console.log('addRequest: ' + message);
    }
}

// ------------------------------------------------------------------------- //
//	PROCESAMIENTO DEL AVATAR, VOZ Y SERVIDOR
// ------------------------------------------------------------------------- //
/* RESPONSIVe VOICE PARAMETERS
<script src='https://code.responsivevoice.org/responsivevoice.js?key=eTTbdFpx'></script>
<script type='text/javascript'>
SDK.applicationId = "44982303877927990";
var sdk = new SDKConnection();
var web = new WebAvatar();
web.version = 8.5;
web.connection = sdk;
web.avatar = "32922078";
web.voice = "cmu-slt";
web.voiceMod = "default";
web.nativeVoice = true;
web.nativeVoiceName = "Spanish Latin American Female";
SDK.initResponsiveVoice();
web.lang = "es";
web.width = "400";
web.createBox();
web.addMessage("Welcome to my website", "", "spin", "");
setTimeout(function() { web.processMessages(); }, 1000);
</script>
*/

/**
	Inicializacion del avatar con la libreria de botlibre
	(necesario para que hable y muestre el video)
*/
function initAvatar() {

    try {
        // test connection first
        //SDK.applicationId = '';
        SDK.applicationId = SDK_APPLICATION_ID;
        SDK.lang = lang_selected;
        sdk = new SDKConnection();
        SDK.autoPlayDelay = 0;
        web = new WebAvatar();
        SDK.debug = SDK_DEBUG;

    } catch {
        console.log("Init Avatar failed cached.");
        setAvatarOffline();
        return;
    }
    console.log("Init Avatar succeded.");
    //configuracion propia del avatar
    web.version = 8.5;
    web.connection = sdk;
    web.avatar = rotate_selected;
    //web.avatar = "14097430";  // Victoria Business
    //web.avatar = "14097447";	// Victoria Casual

    //web.avatar = "14097430";	  // default
    //web.avatar = "32235268";  // Cindy half
    //web.avatar = "14876059";  // Cindy Face
    //web.avatar = "25590091";  // Victoria 8 HD 
    //web.avatar = "11557990";  // Julie

    //web.avatar = "13207484";  // Jessica - no emotions
    //web.avatar = "19096532";  // Brooke Business - no emotions
    //web.avatar = "22370322";  // Elle Business

    // default initialization:
    web.voice = "cmu-slt";
    //web.voice = "istc-lucia-hsmm";
    web.voiceMod = "default";
    // solo funciona en el desktop:
    // - HTML option
    //web.nativeVoiceName = 'Google español de Estados Unidos';
    //web.nativeVoiceName = "Microsoft Helena Desktop - Spanish (Spain)";
    // - Microsoft voice
    //web.nativeVoiceName = "es-ES, Laura, Apollo";
    //web.nativeVoiceName = "es-ES, HelenaRUS";
    //SDK.initBingSpeech(14876059, 'avatar');
    web.nativeVoice = lang_native_voice;
    // - Responsive voice enabling at startup
    if (lang_native_voice) {
        web.lang = 'en'; // default EN

        if (lang_selected == 'es' || lang_native_option == 1) {
            // default spanish config.
            web.lang = lang_native_1_code;
            web.nativeVoiceName = lang_native_1_name;
            SDK.initResponsiveVoice();
        }
        if (lang_selected == 'sp' || lang_native_option == 2) {
            web.lang = lang_native_2_code;
            web.nativeVoiceName = lang_native_2_name;
        }
    }
    // esto hace falta para evitar que arranque con un idioma default pero indique el configurado.
    // quiero ver el idioma real que procesó en la inicialización
    lang_selected = web.lang;
    if (lang_selected == 'es-AR') {
        lang_selected = 'sp';
    }
    document.getElementById('language').innerHTML = lang_selected.toLocaleUpperCase().substring(0, 2);

    web.width = "200";
    web.height = "300";
    web.prefix = null;

    emotion = "happy";
    //emotion = "afraid";	// idem surprise
    //emotion = "crying";	// idem sad
    //emotion = "sad";
    //emotion = "ecstatic";	// idem happy
    //emotion = "like";		// idem happy
    //emotion = "love";		// idem happy
    //emotion = "hate";		// idem anger
    //emotion = "dislike";	// idem anger
    //emotion = "rage";		// idem anger
    //emotion = "anger";	
    //emotion = "panic";	// idem surprise
    //emotion = "surprise";

    //action = "smile";
    //action = "flirt";
    //action = "kiss";
    //action = "scream";
    return;
}
/**
	Comienza a reconocer speech-text con el MIC y lo pega en el user input
	No requiere del avatar.
*/
function startRecognition() {
    if (!checkAudioIsPlaying() && (recognition == null || typeof recognition === 'undefined')) {
        // ok recognition not defined yet 
        // AND audio is not playing (very important to avoid recognizing own avatar speech)
        recognition = new webkitSpeechRecognition();
        recognition.onstart = function(event) {
            updateRec();
        };
        recognition.onresult = function(event) {
            var text = "";
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (!checkAudioIsPlaying()) {
                    text += event.results[i][0].transcript;
                }
            }
            if (!checkAudioIsPlaying()) {
                setInput(text);
            }
            stopRecognition();

        };
        recognition.onend = function() {
            stopRecognition();

        };
        //recognition.lang = lang_selected; // no porque siempre le hablo en ES
        recognition.lang = "es";
        recognition.start();
    }
}

/**
	Para da reconocer speech-text con el MIC
	No requiere del avatar.
*/
function stopRecognition() {
    if (recognition) {
        recognition.stop();
        recognition = null;
    }
    updateRec();
}
/**
	Activacion periodida del MIC para hablar directamente
	No requiere del avatar.
*/
function loopRecognition() {
    if (loop_Speech) {
        // initiates loop to activate MIC every few seconds
        if (!recognition) {
            // MIC not active AND audio is not playing. start and wait to retry
            if (!checkAudioIsPlaying()) {
                startRecognition();
            }
            //console.log("Mic loop ACTIVE. wait n secs and restart.");
            setTimeout(() => {
                loopRecognition();
            }, loop_Speech_ms);
        } else {
            stopRecognition();
            // MIC already active. wait and retry
            setTimeout(() => {
                loopRecognition();
                //console.log("Mic loop WAITING 1 seconds ...");
            }, 1000);
        }
    }
}
/**
	Activa loop de activacion periodida del MIC para hablar directamente
	se llama cuando carga o pasa a pantalla online
*/
function startLoopRecognition() {
    loop_Speech = true;
    loopRecognition();

    let label = document.getElementById('mic-label');
    label.onclick = () => stopLoopRecognition();
    label.innerHTML = '<span style="margin-right: 0px;"><i class="material-icons">loop</i></span>';
    console.log('LOOP started');
}
/**
	Desactiva loop de activacion periodida del MIC para hablar directamente
	se llama cuando pasa a chat manual con watson
*/
function stopLoopRecognition() {
    loop_Speech = false;
    let label = document.getElementById('mic-label');

    label.onclick = () => startLoopRecognition();
    label.innerHTML = '<span style="margin-right: 0px;">MIC</span>';
    console.log('LOOP stopped');
}

/**
	Alterna reconocimiento de speech-text con el MIC
	No requiere del avatar.
*/
function switchRecognition() {
    if (recognition) {
        stopRecognition();
    } else {
        startRecognition();
    }
}
/**
	Pega el texto reconocido del speech en el user input
	No requiere del avatar.
*/
function setInput(text) {
    $("#chat").val(text);
    addRequest(text);
    send();
}
/**
	Cambia el icono del MIC
	No requiere del avatar.
*/
function updateRec() {
    $("#rec").text(recognition ? "mic" : "mic_none");
}

/**
 * Caso especial con MODO GPT activado
 */
function sendGPT(userinput) {
    // var apikeygpt = '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';
    // var baseUrl_gpt = "https://api.openai.com";
    // var resource_gpt = "/v1/chat/completions";
    // var lang_gpt_prompt = "In spanish.";
    if (lang_selected == 'sp' || lang_selected == 'es') {
        lang_gpt_prompt = "In spanish.";
    }
    if (lang_selected == 'en') {
        lang_gpt_prompt = "In english.";        
    }
    if (lang_selected == 'it') {
        lang_gpt_prompt = "In italian.";        
    }
    // GPT request payload (data to be send):
    var data = JSON.stringify(
        {
            "model": gpt_model,
            "messages": [{"role": "user", "content": lang_gpt_prompt + " " + userinput + ". Responder en menos de 100 palabras."}],
            "temperature": 0.7
        }
    );           
    console.log('REQUEST GPT INPUT DATA: **********');
    console.log(JSON.stringify(data));    
    web.addMessage("Okeey", "surprise", "", "");
    processMessages();

    // AJAX processing starts here
    $.ajax({
        type: "POST",
        url: baseUrl_gpt + resource_gpt,
        contentType: "application/json",
        dataType: "json",
        headers: {
            "Content-Type": "application/json",
            "OpenAI-Organization": gpt_org,        
            "Authorization": "Bearer " + apikeygpt  
        },
        data: data,
        success: function(data) {
            // JSON RESPONSE
            console.log('RESPONSE OUTPUT DATA: **********');
            console.log(JSON.stringify(data));
            // ya viene parseado por jquery, aca lo vuelca a consola en formato string
            console.log(data);
            var respuesta = data.choices[0].message.content;
            setResponse(respuesta, null, null);
        },
        error: function(data) {
            console.log('RESPONSE ERROR DATA: **********');
            console.log(data);
            let errordesc = MSG_ERROR_GPT_REQUEST;
            let errortype = 'GPT ERROR';
            if(data.status == '429') {
                errordesc = MSG_ERROR_GPT_QUOTA;
                errortype = 'GPT QUOTA';
                console.log("Error: AJAX GPT no progresa por cuota excedida - 429 too many requests");
            } else {
                console.log("Error: AJAX GPT no progresa, posible falla de red o URL malformada");
            }
            setResponse('GPT_ERROR', errortype, errordesc);
        }
    });

}
/**
	Envia los datos a WATSON mediante AJAX y POST REQUEST
	Requiere de WATSON o devolvera un SERVER_ERROR como respuesta
*/
function send() {

    /* WATSON ASSISTANT API V2 END POINT 
     * OK authBasic 
     * NOT OK: ignora el user input (siempre misma respuesta)
     * NOT OK: pierde contexto 
     */
// var apiKey = "NNx5LAhOS7N3kMyX4DfVyZFfAwzOAFqyznqDW__It0YA";
    // base64('apikey:'+apiKey) = auth_basic (esto lo hace curl, no lo pude hacer en JS)
// var authBasic = "YXBpa2V5Ok5OeDVMQWhPUzdOM2tNeVg0RGZWeVpGZkF3ek9BRnF5em5xRFdfX0l0MFlB";
// var asistId = "b7cde16e-d722-4528-8829-f6d4603de5d6";
// var baseUrl = "https://api.us-south.assistant.watson.cloud.ibm.com/instances/58b2c424-cce2-40a9-a69d-6abaeeb0c746";
    // statefull route (must adquire a session_id first, NOT USED YET)
    //var postSession = "/v2/" + asistId + "/sessions"
    //var postRouteSFull = "/v2/" + asistId + "/sessions"
    // stateless route
// var postRouteSLess = "/v2/assistants/" + asistId + "/message?version=2020-04-01"

    /* WATSON PREVIEW API END POINT 
     * localhost origin API URL
     * emulates to be the preview and its WORKING OK, context included
     */
// var baseUrl = "https://assistant-chat-us-south.watsonplatform.net";
// var postRouteSLess = "/public/message/87aeaa50-cde9-4a52-830d-a57afe0e99d1?version=2020-09-24"
     /* */

    // start reading user input
    var userinput = $("#chat").val();

    if (userinput.length < 1 || typeof userinput === 'undefined') {
        // el bot no escuchó el user input
        setResponse("", null, null);
        return;
    }
    if (processVoiceCommand(userinput)) {
        // INTERNAL voice command detected. DATA NOT WILL BE SENT TO WATSON.
        addHistory('Mandato <b>' + userinput.toLocaleUpperCase() + '</b> ejecutado.');
        return;

    }

    // funcion leer, no envia a WATSON:
    if (userinput.startsWith('leer')) {
        // el bot no escuchó el user input
        setResponse(userinput, null, null);
        return;
    }
    // Es un request para CHAT GPT
    if (chatgpt_on) {
        sendGPT(userinput);
        return;
    }

    // Watson request payload (data to be send):
    var data = JSON.stringify({
        value: {
            id: data_id,
            thread_id: data_thread_id,
            input: {
                text: userinput,
                options: {
                    export: true,
                    debug: true,
                    return_context: true,
                    alternate_responses: false,
                    disambiguation: {
                        alternate_responses: false
                    }
                }
            },
            context: {
                global: {
                    system: {
                        user_id: data_user_id,
                        timezone: data_timezone
                            //turn_count:				data_turn_count
                    }
                },
                skills: {
                    "main skill": {
                        system: data_system_state,
                        user_defined: {}
                    }
                },
                integrations: { chat: { browser_info: {} } }
            },
            history: {}
        },
        //request_id: data_request_id,
        //thread_status: data_thread_status,
        session_id: null,
        user_id: data_user_id
    });
    //data = '{"input": {"text": "Hello"}}';
    console.log('REQUEST INPUT DATA: **********');
    console.log(JSON.stringify(data));

    // AJAX processing starts here
    $.ajax({
        type: "POST",
        url: baseUrl + postRouteSLess,
        contentType: "application/json",
        dataType: "json",
        headers: {
            //"Content-Type": "application/json",
            //X-Global-Transaction-ID:  d2dd75a5-581e-4395-ba3a-96cf16798fc7,
            //"Authorization": "Basic " + authBasic
            "x-watson-is-preview": true
        },
        data: data,
        success: function(data) {

            // JSON RESPONSE
            console.log('RESPONSE OUTPUT DATA: **********');
            console.log(JSON.stringify(data));
            // ya viene parseado por jquery, aca lo vuelca a consola en formato string

            // leer contexto desde la respuesta
            if (typeof data.id !== 'undefined') {
                //data_id = data.id;						//"5822cda8-d0b5-4a21-9f8f-96126fcd349e",
                console.log("data.id ommited: " + data_id);
            }
            if (typeof data.thread_id !== 'undefined') {
                data_thread_id = data.thread_id; //"TH_8ccb5f03-5af8-46bd-a6b6-f9337e5e96ed",
                console.log("data.thread_id: " + data_thread_id);
            }
            if (typeof data.request_id !== 'undefined') {
                data_request_id = data.request_id; //"407fac45-cefd-489b-ad9c-c085ae352fec",
                console.log("data.request_id: " + data_request_id);
            }
            if (typeof data.session_id !== 'undefined') {
                data_session_id = data.session_id; //"64e0f6e8-e7b0-4549-a2be-56d16c93163c"				
                console.log("data.session_id: " + data_session_id);
            }
            // context.skills."main skill".system.state				
            try {
                let skill_ref = "main skill";
                if (typeof data.context.skills !== 'undefined') {
                    data_system_state = { state: data.context.skills[skill_ref].system.state };
                    console.log("data.system_state: " + data_system_state);
                } else {
                    data_system_state = "";
                }
            } catch {
                data_system_state = "";
                console.log("data.system_state failed");
            }
            if (typeof data.thread_status !== 'undefined') {
                data_thread_status = data.thread_status;
            } else {
                data_thread_status = null;
            }
            // leer y procesar respuesta
            var respuesta = "";
            if (typeof data.output.generic !== 'undefined') {
                let len = data.output.generic.length;
                // traverse the generic output array
                for (let x = 0; x < len; x++) {

                    let type = data.output.generic[x].response_type;
                    // handle response type == connect (error)
                    if (type == 'connect_to_agent') {
                        respuesta += MSG_ERROR_WATSON_CONNECT_TO_AGENT_RESPONSE;
                    }
                    // handle response type == suggestion
                    if (type == 'suggestion') {
                        respuesta += MSG_ERROR_WATSON_CONFUSED_SUGGESTION_RESPONSE;
                    }
                    if (type == 'text') {
                        if (!(typeof data.output.generic[x].text === 'undefined')) {
                            let mensaje = data.output.generic[x].text;
                            if (mensaje.length > 0) {
                                respuesta += mensaje + ' <br>';
                            }
                        }
                    }
                    if (type == 'option') {
                        // handle options array
                        let optn = data.output.generic[x].options;
                        if (typeof optn !== 'undefined' && optn.length > 0) {
                            respuesta += '<br>';
                            // traverse the options output array
                            for (let y = 0; y < optn.length; y++) {

                                let option = data.output.generic[x].options[y].value.input.text;
                                if (option.length > 0 && typeof option !== 'undefined') {

                                    let option_link = '';
                                    option_link += '<div class="option-box">';
                                    option_link += '<a href="#" class="option-text" ';
                                    option_link += 'onclick="setInput(' + "'" + option + "'" + ')">' + option + '.</a>';
                                    option_link += '</div>';

                                    // omitir botones de ayuda recurrentes en cada respuesta
                                    if (
                                        option.toLocaleLowerCase() != 'ayuda' &&
                                        option.toLocaleLowerCase() != 'ja ja' &&
                                        option.toLocaleLowerCase() != 'menu'
                                    ) {
                                        respuesta += option_link;
                                    }
                                }
                            }
                            respuesta += '<br>';
                        }
                    }
                }
            }
            console.log("Texto Solicitud: " + userinput);
            console.log("Texto Respuesta: " + respuesta);

            let errordesc = '';
            let errortype = '';
            // este error se presenta si la solicitud tiene datos pero la respuesta viene vacia (no pude decodificarla)
            if (userinput.length > 0 && (typeof respuesta === 'undefined' || respuesta == '')) {
                console.log("Error: POST-RESPONSE sin datos del servidor");
                errordesc = MSG_ERROR_POST_RESPONSE;
                errortype = 'POST-RESPONSE';
                setResponse('SERVER_ERROR', errortype, errordesc);
                return;
            } else {
                setResponse(respuesta, null, null);
                return;
            }
        },
        error: function() {
            console.log("Error: AJAX no progresa, posible falla de red o URL mal formada");
            let errordesc = MSG_ERROR_AJAX_REQUEST;
            let errortype = 'AJAX-REQUEST';
            setResponse('SERVER_ERROR', errortype, errordesc);
            return;

        }
    });

}
/**
	Procesa los datos recibidos de WATSON  RESPONSE
	Puede manejar el SERVER-ERROR, respuestas vacias y respuesta del intent NO ENTIENDO
*/
function setResponse(response, errortype, errordesc) {

    if (typeof web === 'undefined') {
        // initAvatar();
        startTalking();
    }
    document.getElementById("online-div").style.display = "block";
    if (response.legth < 1 || response == "" || typeof response === 'undefined') {
        // el bot no escuchó bien, el user input está vacio
        let txt = "No te oigo. ¿Puedes repetirlo?";
        addHistory(txt);
        if (avatar_avail) {
            web.addMessage("Perdóname,", "dislike", "", "");
            //web.processMessages();
        } else {
            renderOutOffice();
        }
        setTimeout(() => {
            //if (avatar_avail) {
            //web.addMessage("", "", "smile", "");
            web.addMessage(txt, "like", "smile", "");
            //web.processMessages();
            processMessages();
            //} else {
            //    renderOutOffice();
            //}
        }, 1800);
        processMessages();
        return;
    }
    if (response == 'SERVER_ERROR') {
        // server no responde
        let msg = "";
        msg += "Watson no responde. El tipo de error es ";
        msg += errortype + ", y significa " + errordesc;
        msg += ". Trata de recargar la página o puedes ir al " + '<a href="#" onclick="toggleChattingRooms()">Chat manual</a>.';
        addHistory(msg);
        web.addMessage("Maldición, ahora qué, ", "surprise", "", "");
        //web.processMessages();
        setTimeout(() => {
            //web.addMessage("", "", "surprise", "");
            web.addMessage(msg, "sad", "surprise", "");
            //web.processMessages();
            processMessages();
        }, 1800);
        //startChatting();
        processMessages();
        return;
    }
    if (response == 'GPT_ERROR') {
        // GPT no responde
        let msg = "";
        msg += "GPT no responde. El tipo de error es ";
        msg += errortype + ", y significa " + errordesc;
        msg += ". Trata de recargar la página o puedes ir al " + '<a href="#" onclick="toggleChattingRooms()">Chat manual</a>.';
        addHistory(msg);
        web.addMessage("Uuuu, ahora qué, ", "surprise", "", "");
        //web.processMessages();
        setTimeout(() => {
            //web.addMessage("", "", "surprise", "");
            web.addMessage(msg, "sad", "surprise", "");
            //web.processMessages();
            processMessages();
        }, 1800);
        //startChatting();
        processMessages();
        return;
    }    
    if (response != 'SERVER_ERROR' && response != "") {

        // tratamiento especial de intent anyhing_else
        if (response.startsWith("¿What?")) {
            web.addMessage("", "dislike", "", "");
            // ok no hay texto
            web.processMessages();
        }

        // procesa nueva respuesta ok 
        addHistory(response);
        if (avatar_avail) {
            web.addMessage(response, "happy", "", "");
        } else {
            renderOutOffice();
        }
        //processVoiceCommand(userinput);
        //web.processMessages();
        processMessages();
        return;
    }

}
/**
	Procesa los mensajes agregados en la cola del avatar, pero validando si está disponible
*/
function processMessages() {
    if (avatar_avail) {
        try {
            stopRecognition(); // no debe escuchar antes de hablar
            web.processMessages();
        } catch {

            // avatar error
            console.log("Process message on Avatar failed and catched.");
            setAvatarOffline();
            return;
        }

    } else {
        renderOutOffice();
    }
}
/**
	Procesa algunos comandos de voz que actuan sobre funciones de la llamada
*/
function processVoiceCommand(voicetext) {
    if (typeof voicetext !== 'undefined' && voicetext != '') {
        console.log('Voice Command: ' + voicetext);

        scrollTop();
        // CHAT GPT
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_CHAT_GPT35) {
            startTalking();
            rotateGPT();
            return true;
        }
        // HELLO 1 command
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_HELLOWORLD) {
            startTalking();
            return false;
        }
        // DROPCALL 1 command
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_DROPCALL_1) {
            stopTalking();
            return true;
        }
        // DROPCALL 2 command
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_DROPCALL_2) {
            stopTalking();
            return true;
        }
        // DROPCALL 3 command
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_DROPCALL_3) {
            stopTalking();
            return true;
        }
        // STOPCALL command
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_STOPCALL_1) {
            stopTalking();
            return true;
        }
        // MODO TEXTO GO MANUAL command
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_MANUALMODE) {
            stopTalking();
            chatVisible = false;
            toggleChattingRooms();
            return true;
        }
        // TOP PAGE
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_ONLINEMODE) {
            chatVisible = true;
            toggleChattingRooms();
            startTalking();
            return true;
        }
        // MODO DARK
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_GODARKMODE) {
            rotateTheme('OSCURO');
            return true;
        }
        // MODO LIGH
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_GOLIGHMODE) {
            rotateTheme('CLARO');
            return true;
        }
        // MODO CASA
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_LOCATEHOME) {
            rotateAvatarLocation('CASA');
            return true;
        }
        // MODO TRABAJO
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_LOCATE_JOB) {
            rotateAvatarLocation('TRABAJO');
            return true;
        }
        // MODO LICENCIA
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_LOCATE_LIC) {
            rotateAvatarLocation('LICENCIA');
            return true;
        }
        // LANG ESPAÑOL
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_LANGUAG_ES) {
            rotateLanguage('ES');
            return true;
        }
        // LANG ITALIAN
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_LANGUAG_IT) {
            rotateLanguage('IT');
            return true;
        }
        // LANG ENGLLISH
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_LANGUAG_EN) {
            rotateLanguage('EN');
            return true;
        }
        // LANG ESPAÑOL
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_LANGUAG_SP) {
            rotateLanguage('SP');
            return true;
        }
        // TOGGLE VIDEO / CHAT
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_VHISTORIAL) {
            toggleVideoHidding();
            return true;
        }
        // RELOAD PAGE
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_RELOADPAGE) {
            reloadPage();
            return true;
        }
        // HELP VOICE COMMAND
        if (voicetext.toLocaleUpperCase() == VOICE_COMMAND_REPORTHELP) {
            helpVoiceCommand();
            chatVisible = true;
            toggleChattingRooms();
            hiddenVideo = false;
            toggleVideoHidding();
            return true;
        }
    }
    return false;
}
/**
   Ayuda de comandos disponibles
 */
function helpVoiceCommand() {
    let html = "<b>Ordenes de voz disponibles:</b>";
    html += '<span style="font-size: 12px;">';
    html += '<code>';
    html += '<br>Para llamadas:';
    html += '<br>PRESENCIA     ' + helpVoiceCommandLinked(VOICE_COMMAND_HELLOWORLD);
    html += '<br>DROP CALL 1   ' + helpVoiceCommandLinked(VOICE_COMMAND_DROPCALL_1);
    html += '<br>DROP CALL 2   ' + helpVoiceCommandLinked(VOICE_COMMAND_DROPCALL_2);
    html += '<br>DROP CALL 3   ' + helpVoiceCommandLinked(VOICE_COMMAND_DROPCALL_3);
    html += '<br>STOP CALL 1   ' + helpVoiceCommandLinked(VOICE_COMMAND_STOPCALL_1);
    html += '<br>';
    html += '<br>Para navegacion:';
    html += '<br>CHAT GPT      ' + helpVoiceCommandLinked(VOICE_COMMAND_CHAT_GPT35);
    html += '<br>CHAT WATSON   ' + helpVoiceCommandLinked(VOICE_COMMAND_MANUALMODE);
    html += '<br>CHAT ONLINE   ' + helpVoiceCommandLinked(VOICE_COMMAND_ONLINEMODE);
    html += '<br>VER VIDEO     ' + helpVoiceCommandLinked(VOICE_COMMAND_VHISTORIAL);
    html += '<br>RECARGA       ' + helpVoiceCommandLinked(VOICE_COMMAND_RELOADPAGE);
    html += '<br>';
    html += '<br>Control de Modos:';
    html += '<br>MODO          ' + helpVoiceCommandLinked(VOICE_COMMAND_GODARKMODE);
    html += '<br>MODO          ' + helpVoiceCommandLinked(VOICE_COMMAND_GOLIGHMODE);
    html += '<br>LUGAR         ' + helpVoiceCommandLinked(VOICE_COMMAND_LOCATEHOME);
    html += '<br>LUGAR         ' + helpVoiceCommandLinked(VOICE_COMMAND_LOCATE_JOB);
    html += '<br>LUGAR         ' + helpVoiceCommandLinked(VOICE_COMMAND_LOCATE_LIC);
    html += '<br>IDIOMA        ' + helpVoiceCommandLinked(VOICE_COMMAND_LANGUAG_ES);
    html += '<br>IDIOMA        ' + helpVoiceCommandLinked(VOICE_COMMAND_LANGUAG_IT);
    html += '<br>IDIOMA        ' + helpVoiceCommandLinked(VOICE_COMMAND_LANGUAG_EN);
    html += '<br>IDIOMA        ' + helpVoiceCommandLinked(VOICE_COMMAND_LANGUAG_SP);
    html += '<br>';
    html += '</code></span>';
    addHistory(html);
}

function helpVoiceCommandLinked(cmd) {
    return '<a href="#" class="red-text" onclick="setInput(' + "'" + cmd + "'" + ')"><b>' + cmd + '</b></a>.';
}

// BOTLIBRE HACKING: 
// console error catching when API reaches maximun, or has POST errors
// this is needed to detecte Botlibre Maximun Daily API calls reached
// It also is needed if you want to catch SDK errors or POST failures.

/**
Retrieve POST erors from the SDK libray
This function needs to be hardcode added in the sdk.js library, to working properly. 
On upgrades, download the js file, find that error and add this method to report errors here
	1:	Error: SDK POST web request failed
*/
function vicky_sdk_error_1(e) {
    console.log('VICKY catched error 1: ' + e);
    if (e.startsWith('Error: SDK POST')) {
        addHistory(MSG_ERROR_SDK_POST);
        rotateAvatarLocation('LICENCIA');
    }
}
/**
Retrieve LOG erors from the SDK libray
This function needs to be hardcode added in the sdk.js library, to working properly. 
On upgrades, download the js file, find that error and add this method to report errors here
	2:	Daily maximum API calls reached, please upgrade your accoun
*/
function vicky_sdk_error_2(e) {
    console.log('VICKY catched error 2: ' + e);
    // mensaje al usuario y cambio de estado a LICENCIA
    if (e.startsWith('Daily maximum API calls reached')) {
        addHistory(MSG_ERROR_SDK_API);
        rotateAvatarLocation('LICENCIA');
    }
}
/**
Retrieve API POST responses from the SDK libray
This function needs to be hardcode added in the sdk.js library, to working properly. 
On upgrades, download the js file, find that error and add this method to report errors here
	Tracing API POSTs (response)
*/
function vicky_sdk_api_tracing(t) {
    console.log('VICKY catched SDK API tracing: ' + t);
}

/* end of file */