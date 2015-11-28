
/* Get ROScore IP, make a connection to Frobit's ROScore and initialize ROS in js */
function frobit_init_ros() {

    // Get IP of Frobit Ubuntu on SDU-GUEST
    $.getJSON('http://whateverorigin.org/get?url='+encodeURIComponent('http://evee.cz/sdu/rsd/ips/ip_frobit.txt')+'&callback=?',
        function (data) {
            //ip_frobit = data.contents;    // Connect HMI to Frobit
            ip_frobit = '10.125.7.186';     // Test HMI on your computer (put your IP)
            frobit_got_ip();
            frobit_connect_roscore();
    });
}

function frobit_connect_roscore() {

    // Connecting to Frobit's ROSCORE using ROSBRIDGE
    ros_frobit = new ROSLIB.Ros({
        url : 'ws://'+ip_frobit+':9090'
    });

    ros_frobit.on('connection', function() {
        frobit_ros_connected();
    });

    ros_frobit.on('error', function(error) {
        console.log('Error connecting to Frobit\'s ROSCORE on '+ip_frobit+': ', error);
        to_console('Error connecting to Frobit\'s ROSCORE on '+ip_frobit+'.');
    });

    ros_frobit.on('close', function() {
        frobit_ros_disconnected();
    });

    // Topics on Frobit's ROSCORE
    frobit_tp_ui_str_control = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/ui/str_control_frobit',
        messageType : 'std_msgs/String'
    });

    frobit_tp_cmd_vel = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/fmCommand/cmd_vel',
        messageType : 'geometry_msgs/TwistStamped'
    });

    frobit_tp_automode = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/fmPlan/automode',
        messageType : 'msgs/IntStamped'
    });

    frobit_tp_mes_control = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/ui/mes',
        messageType : 'msgs/IntStamped'
    });

    frobit_tp_next_mission = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/mission/next_mission',
        messageType : 'std_msgs/String'
    });

    frobit_tp_usbcam = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/usb_cam/image_raw/compressed',
        messageType : 'sensor_msgs/CompressedImage'
    });

    tipper_tp_automode = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/ui/tipper_automode',
        messageType : 'msgs/BoolStamped'
    });

    tipper_tp_answer = new ROSLIB.Topic({
        ros : ros_frobit,
        name : '/arduino_answer',
        messageType : 'msgs/IntStamped'
    });

    // Mobile Robot velocities (linear and angular) !!??
    frobit_tp_cmd_vel.subscribe(function(message) {
        frobit_got_velocities(message)
    });

    // Mobile Robot control mode
    frobit_tp_automode.subscribe(function(message) {
        frobit_got_mode(message);
    });

    // Mobile Robot next mission subscription
    frobit_tp_next_mission.subscribe(function(message) {
        frobit_got_next_mission(message);
    });

    // Image from MR usbcam
    frobit_tp_usbcam.subscribe(function(message) {
        frobit_got_camera_data(message);
    });

    // Tipper automode state subscription
    tipper_tp_automode.subscribe(function(message) {
        tipper_got_mode(message);
    });

    // Tipper position subscription
    tipper_tp_answer.subscribe(function(message) {
        tipper_got_answer(message);
    });

    // Services : Monitoring ROS structure
    frobit_srv_topics = new ROSLIB.Service({
        ros : ros_frobit,
        name : '/rosapi/topics',
        serviceType : 'rosapi/Topics'
    });

    frobit_srv_nodes = new ROSLIB.Service({
        ros : ros_frobit,
        name : '/rosapi/nodes',
        serviceType : 'rosapi/Nodes'
    });

    frobit_srv_services = new ROSLIB.Service({
        ros : ros_frobit,
        name : '/rosapi/services',
        serviceType : 'rosapi/Services'
    });
}

function frobit_got_ip() {
    document.getElementById('mr_monitor_ip').innerHTML = ip_frobit;
    document.getElementById('tipper_monitor_ip').innerHTML = ip_frobit;
    console.log('Frobit IP: '+ip_frobit);
}

function frobit_ros_connected() {
    // Connected Indication
    document.getElementById("onoff_frobit").checked = 'checked';
    document.getElementById("mr_monitor_ip").style.backgroundColor = 'LightGreen';
    document.getElementById("tipper_monitor_ip").style.backgroundColor = 'LightGreen';

    // Enable control of Frobit
    document.getElementById("mr_manual_control_frame").style.opacity = 1.0;
    document.getElementById("mr_man_auto_switch").disabled = '';
    document.getElementById("img_safety_button_frobit").style.cursor = "pointer";
    document.getElementById("joystick_container").style.visibility = "visible";

    // Enable control of Tipper
    document.getElementById("tipper_manual_control_frame").style.opacity = 1.0;
    document.getElementById("tipper_man_auto_switch").disabled = '';
    document.getElementsByClassName("tipper_button")[0].disabled = '';
    document.getElementsByClassName("tipper_button")[1].disabled = '';
    document.getElementById("img_safety_button_tipper").style.cursor = "pointer";

    // Monitor Frobit's ROS structure, [ms]
    frobit_monitor_interval = setInterval(frobit_update_ros_structure, 1000);

    // Console Info
    console.log('Connected to Frobit\'s ROSCORE on '+ip_frobit+'.');
    to_console('Connected to Frobit\'s ROSCORE on '+ip_frobit+'.');
}

function frobit_ros_disconnected() {
    // Frobit Monitoring
    document.getElementById("mr_monitor_mode").innerHTML = "&nbsp;";
    document.getElementById("mr_monitor_mission").innerHTML = "&nbsp;";
    document.getElementById("mr_monitor_position").innerHTML = "&nbsp;";
    document.getElementById("mr_monitor_linvel").innerHTML = "&nbsp;";
    document.getElementById("mr_monitor_angvel").innerHTML = "&nbsp;";

    //Frobit Control Options
    document.getElementById("mr_manual_control_frame").style.opacity = 0.5;
    document.getElementById("mr_man_auto_switch").disabled = 'disabled';
    document.getElementById("joystick_container").style.visibility = "hidden";
    document.getElementById("img_safety_button_frobit").src = "img/cant_read_frobit.png";
    document.getElementById("img_safety_button_frobit").onclick = ""
    document.getElementById("img_safety_button_frobit").style.cursor = "wait";

    // Tipper Monitoring
    document.getElementById("tipper_monitor_mode").innerHTML = "&nbsp;";
    document.getElementById("tipper_monitor_position").innerHTML = "&nbsp;";

    // Tipper Control Options
    document.getElementById("tipper_manual_control_frame").style.opacity = 0.5;
    document.getElementById("tipper_man_auto_switch").disabled = 'disabled';
    document.getElementsByClassName("tipper_button")[0].disabled = 'disabled';
    document.getElementsByClassName("tipper_button")[1].disabled = 'disabled';
    document.getElementById("img_safety_button_tipper").src = "img/cant_read_frobit.png";
    document.getElementById("img_safety_button_tipper").onclick = ""
    document.getElementById("img_safety_button_tipper").style.cursor = "wait";

    // Disconnected Indication
    document.getElementById("onoff_frobit").checked = '';
    document.getElementById("mr_monitor_ip").style.backgroundColor = 'Red';
    document.getElementById("tipper_monitor_ip").style.backgroundColor = 'Red';

    // Stop Monitoring Frobit's ROS structure
    clearInterval(frobit_monitor_interval);

    // Console Info
    console.log('Connection to Frobit\'s ROSCORE on '+ip_frobit+' closed.');
    to_console('Connection to Frobit\'s ROSCORE on '+ip_frobit+' closed.');
}

/* Publish control for Frobit */
function frobit_ros_msg(data_str) {
    var msg = new ROSLIB.Message({data : data_str});
    frobit_tp_ui_str_control.publish(msg);
    console.log(msg);
    to_console('To Frobit: '+msg.data);
}

function frobit_update_ros_structure() {
    try {
        frobit_srv_topics.callService(new ROSLIB.ServiceRequest(), function(result) {
            var topics_frobit_str = '';
            for (var i in result.topics) {
              topics_frobit_str += result.topics[i]+'<br />';
            }
            document.getElementById('ros_mr_topics').innerHTML = topics_frobit_str;
        });
        frobit_srv_nodes.callService(new ROSLIB.ServiceRequest(), function(result) {
            var nodes_frobit_str = '';
            for (var i in result.nodes) {
              nodes_frobit_str += result.nodes[i]+'<br />';
            }
            document.getElementById('ros_mr_nodes').innerHTML = nodes_frobit_str;
        });
        frobit_srv_services.callService(new ROSLIB.ServiceRequest(), function(result) {
            var services_frobit_str = '';
            for (var i in result.services) {
              services_frobit_str += result.services[i]+'<br />';
            }
            document.getElementById('ros_mr_services').innerHTML = services_frobit_str;
        });
    } catch (err) {
        console.log(err.message);
    }
}