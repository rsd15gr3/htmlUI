
/* Change Belt's mode to be Automode */
function belt_make_automode_true() {
    wc_ros_msg('belt_mode_auto');
}

/* Change Belt's mode to be Manual */
function belt_make_automode_false() {
    wc_ros_msg('belt_mode_manual');
}

/* Belt automode topic subscribed and evaluated as True */
function belt_automode_is_true() {
    document.getElementById("belt_monitor_mode").innerHTML = 'Automode';
    document.getElementById("img_safety_button_belt").src = "img/stop_belt.png";
    document.getElementById("img_safety_button_belt").onclick = belt_make_automode_false;
    document.getElementById('belt_man_auto_switch').checked = true;
    document.getElementsByClassName('beltonoffswitch')[0].style.opacity = 0.5;
    document.getElementsByClassName('beltdirectionswitch')[0].style.opacity = 0.5;
    document.getElementsByClassName('beltspeedswitch')[0].style.opacity = 0.5;
}

/* Belt automode topic subscribed and evaluated as False */
function belt_automode_is_false() {
    document.getElementById("belt_monitor_mode").innerHTML = 'Manual control';
    document.getElementById("img_safety_button_belt").src = "img/run_belt_auto.png";
    document.getElementById("img_safety_button_belt").onclick = belt_make_automode_true;
    document.getElementById('belt_man_auto_switch').checked = false;
    document.getElementsByClassName('beltonoffswitch')[0].style.opacity = 1.0;
    document.getElementsByClassName('beltdirectionswitch')[0].style.opacity = 1.0;
    document.getElementsByClassName('beltspeedswitch')[0].style.opacity = 1.0;
}

function belt_call_srv() {
    var str_control = 'belt_srv';
    if (document.getElementById('belt_on_off_switch').checked) {
        str_control += '_on';
    } else {
        str_control += '_off'
    }

    if (document.getElementById('belt_direction_switch').checked) {
        str_control += '_forward';
    } else {
        str_control += '_backwards'
    }

    if (document.getElementById('belt_speed_switch').checked) {
        str_control += '_slow';
    } else {
        str_control += '_fast'
    }

    wc_ros_msg(str_control);
}

/* Manual-auto control of belt changed */
function belt_man_auto_changed() {
    if (document.getElementById('belt_man_auto_switch').checked) {
        belt_make_automode_true();
    } else {
        belt_make_automode_false();
    }
}

function belt_got_mode(message) {
    if (message.data == true) {
        belt_automode_is_true();
    } else if (message.data == false) {
        belt_automode_is_false();
    }
}

function belt_got_status(message) {
    if (message.data == true) {
        document.getElementById("belt_monitor_status").innerHTML = "On"
        document.getElementById("belt_on_off_switch").checked = true;
    } else if (message.data == false) {
        document.getElementById("belt_monitor_status").innerHTML = "Off"
        document.getElementById("belt_on_off_switch").checked = false;
    }
}

function belt_got_direction(message) {
    if (message.data == true) {
        document.getElementById("belt_monitor_direction").innerHTML = "Forward"
        document.getElementById("belt_direction_switch").checked = true;
    } else if (message.data == false) {
        document.getElementById("belt_monitor_direction").innerHTML = "Backwards"
        document.getElementById("belt_direction_switch").checked = false;
    }
}

function belt_got_speed(message) {
    if (message.data == 1) {
        document.getElementById("belt_monitor_speed").innerHTML = "1 : Fast"
        document.getElementById("belt_speed_switch").checked = false;
    } else if (message.data == 2) {
        document.getElementById("belt_monitor_speed").innerHTML = "2 : Slow"
        document.getElementById("belt_speed_switch").checked = true;
    }
}

/* Belt switched on/off */
function belt_settings_changed() {
    if (document.getElementById('belt_on_off_switch').checked) {
        belt_call_srv();
    }
}