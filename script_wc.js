
/* Change Workcell's mode to be Automode */
function wc_make_automode_true() {
    wc_ros_msg('wc_mode_auto');
}

/* Change Workcell's mode to be Manual */
function wc_make_automode_false() {
    wc_ros_msg('wc_mode_manual');
}

function wc_automode_is_true() {
    document.getElementById("wc_monitor_mode").innerHTML = 'Automode';
    document.getElementById("img_safety_button_wc").src = "img/stop_workcell.png";
    document.getElementById("img_safety_button_wc").onclick = wc_make_automode_false;
    document.getElementById('wc_mc_table').style.opacity = 0.5;
    document.getElementById('wc_man_auto_switch').checked = true
}

function wc_automode_is_false() {
    document.getElementById("wc_monitor_mode").innerHTML = 'Manual control';
    document.getElementById("img_safety_button_wc").src = "img/run_workcell_auto.png";
    document.getElementById("img_safety_button_wc").onclick = wc_make_automode_true;
    document.getElementById('wc_mc_table').style.opacity = 1.0;
    document.getElementById('wc_man_auto_switch').checked = false
}

/* Manual-auto control of workcell changed */
function wc_man_auto_changed() {
    if (document.getElementById('wc_man_auto_switch').checked) {
        wc_make_automode_true();
    } else {
        wc_make_automode_false();
    }
}

/* Manual control for workcell : configuration changed down */
function wc_mc_joint_down(joint_id) {
    var slider = document.getElementById('wc_mc_slider_'+joint_id);
    var new_val = parseFloat(slider.value)-parseFloat(wc_mc_joint_step);
    if (parseFloat(new_val) >= parseFloat(slider.min)) {
        wc_ros_msg('wc_joint_'+joint_id+'_down');
        to_console('WC: Joint '+joint_id+' set to '+new_val);
    }
}

/* Manual control for workcell : configuration changed up */
function wc_mc_joint_up(joint_id) {
    var slider = document.getElementById('wc_mc_slider_'+joint_id);
    var new_val = parseFloat(slider.value)+parseFloat(wc_mc_joint_step);
    if (parseFloat(new_val) <= parseFloat(slider.max)) {
        wc_ros_msg('wc_joint_'+joint_id+'_up');
        to_console('WC: Joint '+joint_id+' set to '+new_val);
    }
}

function wc_got_mode(message) {
    if (message.data == true) {
        wc_automode_is_true();
    } else if (message.data == false) {
        wc_automode_is_false();
    }
}

/* Set workcell parameters to the control system */
function wc_init_manual_control() {
    /* set boundaries and step for each joint */

    // j0
    document.getElementById('wc_mc_slider_j0').min = parseFloat(wc_mc_j0_min);
    document.getElementById('wc_mc_slider_j0').max = parseFloat(wc_mc_j0_max);
    document.getElementById('wc_mc_slider_j0').step = parseFloat(wc_mc_joint_step);
    document.getElementById('wc_mc_slider_j0').value = parseFloat(wc_mc_j0_init);
    document.getElementById('wc_mc_min_j0').innerHTML = parseFloat(wc_mc_j0_min);
    document.getElementById('wc_mc_max_j0').innerHTML = parseFloat(wc_mc_j0_max);

    // j1
    document.getElementById('wc_mc_slider_j1').min = parseFloat(wc_mc_j1_min);
    document.getElementById('wc_mc_slider_j1').max = parseFloat(wc_mc_j1_max);
    document.getElementById('wc_mc_slider_j1').step = parseFloat(wc_mc_joint_step);
    document.getElementById('wc_mc_slider_j1').value = parseFloat(wc_mc_j1_init);
    document.getElementById('wc_mc_min_j1').innerHTML = parseFloat(wc_mc_j1_min);
    document.getElementById('wc_mc_max_j1').innerHTML = parseFloat(wc_mc_j1_max);

    // j2
    document.getElementById('wc_mc_slider_j2').min = parseFloat(wc_mc_j2_min);
    document.getElementById('wc_mc_slider_j2').max = parseFloat(wc_mc_j2_max);
    document.getElementById('wc_mc_slider_j2').step = parseFloat(wc_mc_joint_step);
    document.getElementById('wc_mc_slider_j2').value = parseFloat(wc_mc_j2_init);
    document.getElementById('wc_mc_min_j2').innerHTML = parseFloat(wc_mc_j2_min);
    document.getElementById('wc_mc_max_j2').innerHTML = parseFloat(wc_mc_j2_max);

    // j3
    document.getElementById('wc_mc_slider_j3').min = parseFloat(wc_mc_j3_min);
    document.getElementById('wc_mc_slider_j3').max = parseFloat(wc_mc_j3_max);
    document.getElementById('wc_mc_slider_j3').step = parseFloat(wc_mc_joint_step);
    document.getElementById('wc_mc_slider_j3').value = parseFloat(wc_mc_j3_init);
    document.getElementById('wc_mc_min_j3').innerHTML = parseFloat(wc_mc_j3_min);
    document.getElementById('wc_mc_max_j3').innerHTML = parseFloat(wc_mc_j3_max);

    // j4
    document.getElementById('wc_mc_slider_j4').min = parseFloat(wc_mc_j4_min);
    document.getElementById('wc_mc_slider_j4').max = parseFloat(wc_mc_j4_max);
    document.getElementById('wc_mc_slider_j4').step = parseFloat(wc_mc_joint_step);
    document.getElementById('wc_mc_slider_j4').value = parseFloat(wc_mc_j4_init);
    document.getElementById('wc_mc_min_j4').innerHTML = parseFloat(wc_mc_j4_min);
    document.getElementById('wc_mc_max_j4').innerHTML = parseFloat(wc_mc_j4_max);

    // j5
    document.getElementById('wc_mc_slider_j5').min = parseFloat(wc_mc_j5_min);
    document.getElementById('wc_mc_slider_j5').max = parseFloat(wc_mc_j5_max);
    document.getElementById('wc_mc_slider_j5').step = parseFloat(wc_mc_joint_step);
    document.getElementById('wc_mc_slider_j5').value = parseFloat(wc_mc_j5_init);
    document.getElementById('wc_mc_min_j5').innerHTML = parseFloat(wc_mc_j5_min);
    document.getElementById('wc_mc_max_j5').innerHTML = parseFloat(wc_mc_j5_max);
}

/* Sets KUKA configuration after reading it */
function wc_update_kuka_configuration(q) {
    // Sliders
    document.getElementById('wc_mc_slider_j0').value = parseFloat(q[0]);
    document.getElementById('wc_mc_slider_j1').value = parseFloat(q[1]);
    document.getElementById('wc_mc_slider_j2').value = parseFloat(q[2]);
    document.getElementById('wc_mc_slider_j3').value = parseFloat(q[3]);
    document.getElementById('wc_mc_slider_j4').value = parseFloat(q[4]);
    document.getElementById('wc_mc_slider_j5').value = parseFloat(q[5]);

    // Monitor cells
    document.getElementById('wc_monitor_j0').innerHTML = q[0];
    document.getElementById('wc_monitor_j1').innerHTML = q[1];
    document.getElementById('wc_monitor_j2').innerHTML = q[2];
    document.getElementById('wc_monitor_j3').innerHTML = q[3];
    document.getElementById('wc_monitor_j4').innerHTML = q[4];
    document.getElementById('wc_monitor_j5').innerHTML = q[5];
}