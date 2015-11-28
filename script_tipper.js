
function tipper_make_automode_true() {
    frobit_ros_msg('tipper_mode_auto');
}

function tipper_make_automode_false() {
    frobit_ros_msg('tipper_mode_manual');
}

function tipper_make_tipping() {
    frobit_ros_msg('tipper_move_tipping');
}

function tipper_make_idle() {
    frobit_ros_msg('tipper_move_idle');
}

/* Manual-auto control of tipper changed */
function tipper_man_auto_changed() {
    if (document.getElementById('tipper_man_auto_switch').checked) {
        tipper_make_automode_true();
    } else {
        tipper_make_automode_false();
    }
}

function tipper_automode_is_true() {
    document.getElementById("tipper_monitor_mode").innerHTML = 'Automode';
    document.getElementById("img_safety_button_tipper").src = "img/stop_tipper.png";
    document.getElementById("img_safety_button_tipper").onclick = tipper_make_automode_false;
    document.getElementById('tipper_man_auto_switch').checked = true;
    document.getElementById('tipper_manual_frame').style.opacity = 0.5;
}

function tipper_automode_is_false() {
    document.getElementById("tipper_monitor_mode").innerHTML = 'Manual control';
    document.getElementById("img_safety_button_tipper").src = "img/run_tipper_auto.png";
    document.getElementById("img_safety_button_tipper").onclick = tipper_make_automode_true;
    document.getElementById('tipper_man_auto_switch').checked = false;
    document.getElementById('tipper_manual_frame').style.opacity = 1.0;
}

function tipper_got_mode(message) {
    if (message.data == true) {
        tipper_automode_is_true();
    } else if (message.data == false) {
        tipper_automode_is_false();
    }
}

function tipper_got_answer(message) {
    switch(message.data){
        case 0:
            document.getElementById("tipper_monitor_position").innerHTML = "0: Tipping";
            document.getElementById("tipper_img").src = "img/tipper_tipping.png";
            break;
        case 1:
            document.getElementById("tipper_monitor_position").innerHTML = "1: DarthVader";
            document.getElementById("tipper_img").src = "img/darth_vader.png";
            break;
        case 2:
            document.getElementById("tipper_monitor_position").innerHTML = "2: Idle";
            document.getElementById("tipper_img").src = "img/tipper_idle.png";
            break;
    }
    document.getElementById("tipper_slider").value = parseInt(2-message.data);
}