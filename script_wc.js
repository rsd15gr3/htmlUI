
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
function wc_mc_joint_down(joint_ind) {
    var conf = current_kuka_configuration;
    var joint_ind = parseInt(joint_ind);
    try {
        var old_joint_value = conf[joint_ind];
        var new_val = parseFloat(old_joint_value)-parseFloat(wc_mc_joint_step);
        var slider = document.getElementById('wc_mc_slider_j'+joint_ind);
        if (new_val >= parseFloat(slider.min)) {
            conf[joint_ind] = new_val;
            wc_call_srv_setconf(conf);
        } else {
            to_console('NOT allowed. You are trying to get out of bounds.');
        }
    } catch (err) {
        to_console('Not possible to set a new configuration. ');
        console.log('Setting new conf error: '+err);
    }
}

/* Manual control for workcell : configuration changed up */
function wc_mc_joint_up(joint_ind) {
    var conf = current_kuka_configuration;
    var joint_ind = parseInt(joint_ind);
    try {
        var old_joint_value = conf[joint_ind];
        var new_val = parseFloat(old_joint_value)+parseFloat(wc_mc_joint_step);
        var slider = document.getElementById('wc_mc_slider_j'+joint_ind);
        if (new_val <= parseFloat(slider.max)) {
            conf[joint_ind] = new_val;
            wc_call_srv_setconf(conf);
        } else {
            to_console('NOT allowed. You are trying to get out of bounds.');
        }
    } catch (err) {
        to_console('Not possible to set a new configuration. ');
        console.log('Setting new conf error: '+err);
    }
}

function wc_mc_init_pos() {
    wc_call_srv_setconf([0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
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

    // step
    document.getElementById('wc_mc_step_td').innerHTML = "single step: "+parseFloat(wc_mc_joint_step)+" degrees";
}

/* Sets KUKA configuration after reading it */
function wc_update_kuka_configuration() {
    // Sliders
    document.getElementById('wc_mc_slider_j0').value = parseFloat(current_kuka_configuration[0]);
    document.getElementById('wc_mc_slider_j1').value = parseFloat(current_kuka_configuration[1]);
    document.getElementById('wc_mc_slider_j2').value = parseFloat(current_kuka_configuration[2]);
    document.getElementById('wc_mc_slider_j3').value = parseFloat(current_kuka_configuration[3]);
    document.getElementById('wc_mc_slider_j4').value = parseFloat(current_kuka_configuration[4]);
    document.getElementById('wc_mc_slider_j5').value = parseFloat(current_kuka_configuration[5]);

    // Monitor cells
    document.getElementById('wc_monitor_j0').innerHTML = round_2(current_kuka_configuration[0]);
    document.getElementById('wc_monitor_j1').innerHTML = round_2(current_kuka_configuration[1]);
    document.getElementById('wc_monitor_j2').innerHTML = round_2(current_kuka_configuration[2]);
    document.getElementById('wc_monitor_j3').innerHTML = round_2(current_kuka_configuration[3]);
    document.getElementById('wc_monitor_j4').innerHTML = round_2(current_kuka_configuration[4]);
    document.getElementById('wc_monitor_j5').innerHTML = round_2(current_kuka_configuration[5]);
}

function wc_disable_manual_control() {
    var btns = document.getElementsByClassName("wc_mc_table_button");
    for(var i = 0; i < btns.length; i++) {
       btns.item(i).disabled = 'disabled';
       btns.item(i).style.opacity = 0.5;
    }
    document.getElementById("wc_mc_go_to_init_button").disabled = 'disabled';
    document.getElementById("wc_mc_go_to_init_button").style.opacity = 0.5;
}

function wc_enable_manual_control() {
    var btns = document.getElementsByClassName("wc_mc_table_button");
    for(var i = 0; i < btns.length; i++) {
       btns.item(i).disabled = '';
       btns.item(i).style.opacity = 1.0;
    }
    document.getElementById("wc_mc_go_to_init_button").disabled = '';
    document.getElementById("wc_mc_go_to_init_button").style.opacity = 1.0;
}

function wc_erase_monitor_conf() {
    document.getElementById("wc_monitor_j0").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j1").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j2").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j3").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j4").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_j5").innerHTML = "&nbsp;";
}