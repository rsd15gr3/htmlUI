/* Immediately when the site is refreshed this function is called */
function on_loaded_page() {
    document.getElementById("onoff_frobit_sim").checked = 'checked'; // this how to set the button checked

    $('#manual_control_frame').bind('keydown', function(event) {
        console.log(event.keyCode);
        document.getElementById('mr_man_auto_switch').checked = false;
        mr_man_auto_changed()

        switch(event.keyCode){
            case 37:
                ros_btn_msg('left');
            break;

            case 38:
                ros_btn_msg('forward');
            break;

            case 39:
                ros_btn_msg('right');
            break;

            case 40:
                ros_btn_msg('back');
            break;

            case 83:
                ros_btn_msg('stop');
            break;
        }
    });
    document.getElementById('manual_control_frame').focus();

    setInterval("update_subscribers()", 1000);    // Subscribe every 2 seconds
    to_console('Website loaded.')
}

/* Show text in self-created console in our UI */
function to_console(text) {
    var ta = document.getElementById('textarea_console');
    ta.value += "\n=> "+text;
    ta.scrollTop = ta.scrollHeight;
}

/* Publish control to the topic */
function ros_btn_msg(data_str) {
    var msg = new ROSLIB.Message({data : data_str})
    ui_str_control_topic.publish(msg);
    console.log(msg)
}

/* Manual-auto control of mobile robot changed */
function mr_man_auto_changed() {
    if (document.getElementById('mr_man_auto_switch').checked) {
        ros_btn_msg('mr_mode_auto');
        set_opacity_for_man_control(0.5);
    } else {
        ros_btn_msg('mr_mode_manual');
        set_opacity_for_man_control(1.0);
    }
}

/* Manual control joystick looks disabled/enabled */
function set_opacity_for_man_control(op) {
    document.getElementById('mc_button_up').style.opacity = op;
    document.getElementById('mc_button_left').style.opacity = op;
    document.getElementById('mc_button_right').style.opacity = op;
    document.getElementById('mc_button_down').style.opacity = op;
    document.getElementById('mc_button_stop').style.opacity = op;
}

function update_subscribers() {

    // Mobile Robot velocities (linear and angular)
    cmd_vel_topic.subscribe(function(message) {
        document.getElementById("mr_monitor_cell_lin_vel").innerHTML = Math.round(message.twist.linear.x * 100) / 100;
        document.getElementById("mr_monitor_cell_ang_vel").innerHTML = Math.round(message.twist.angular.z * 100) / 100;
        cmd_vel_topic.unsubscribe();
    });
}