
/* Change Frobit's mode to be Automode */
function frobit_make_automode_true() {
    frobit_ros_msg('frobit_mode_auto');
}

/* Change Frobit's mode to be Manual */
function frobit_make_automode_false() {
    frobit_ros_msg('frobit_mode_manual');
}

/* Change on the joystick */
function frobit_joystick_moved(x0, y0, x, y) {
    var x_rounded = Math.round(x * 100) / 100;
    var y_rounded = Math.round(y * 100) / 100;
    frobit_ros_msg('frobit_joystick_'+x0+";"+y0+";"+x_rounded+";"+y_rounded);
}

/* Frobit automode topic subscribed and evaluated as True */
function frobit_automode_is_true() {
    document.getElementById("mr_monitor_mode").innerHTML = 'Automode';
    document.getElementById("img_safety_button_frobit").src = "img/stop_frobit.png";
    document.getElementById("img_safety_button_frobit").onclick = frobit_make_automode_false;
    document.getElementById('joystick_base').style.opacity = 0.5;
    document.getElementById('joystick_stick').style.opacity = 0.5;
    document.getElementById('mr_man_auto_switch').checked = true;
}

/* Frobit automode topic subscribed and evaluated as False */
function frobit_automode_is_false() {
    document.getElementById("mr_monitor_mode").innerHTML = 'Manual control';
    document.getElementById("img_safety_button_frobit").src = "img/run_frobit_auto.png";
    document.getElementById("img_safety_button_frobit").onclick = frobit_make_automode_true;
    document.getElementById('joystick_base').style.opacity = 1.0;
    document.getElementById('joystick_stick').style.opacity = 1.0;
    document.getElementById('mr_man_auto_switch').checked = false;
}

/* Manual-auto control of mobile robot changed */
function frobit_man_auto_changed() {
    if (document.getElementById('mr_man_auto_switch').checked) {
        frobit_make_automode_true();
    } else {
        frobit_make_automode_false();
    }
}

function frobit_got_mode(message) {
    if (message.data == 1) {
        frobit_automode_is_true();
    } else if (message.data == 0) {
        frobit_automode_is_false();
    }
}

function frobit_got_velocities(message) {
    document.getElementById("mr_monitor_linvel").innerHTML = Math.round(message.twist.linear.x * 100) / 100;
    document.getElementById("mr_monitor_angvel").innerHTML = Math.round(message.twist.angular.z * 100) / 100;
}

function frobit_got_camera_data(message) {
    document.getElementById("cam_mr_img").src = "data:image/png;base64,"+message.data;
}

function frobit_got_next_mission(message) {
    document.getElementById("mes_mr_next_mission_div").innerHTML = 'Next mission: '+message.data;
    document.getElementById("mr_monitor_mission").innerHTML = message.data;
}