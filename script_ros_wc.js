
/* Make a connection to Workcell's ROScore and init topics */
function wc_init_ros() {

    // Get IP of Workcell Ubuntu on SDU-GUEST
    $.getJSON('http://whateverorigin.org/get?url='+encodeURIComponent('http://evee.cz/sdu/rsd/ips/ip_workcell.txt')+'&callback=?',
        function (data) {
            ip_workcell = data.contents;      // Connect HMI to Workcel PC
            //ip_workcell = '10.125.7.23';       // Test HMI on your computer (put your IP)
            wc_got_ip();
            wc_connect_roscore();
    });
}

function wc_connect_roscore() {
    // Connecting to Workcell's ROSCORE using ROSBRIDGE
    ros_workcell = new ROSLIB.Ros({
        url : 'ws://'+ip_workcell+':9090'
    });

    ros_workcell.on('connection', function() {
        wc_ros_connected();
    });

    ros_workcell.on('error', function(error) {
        console.log('Error connecting to Workcell\'s ROSCORE on '+ip_workcell+': ', error);
        to_console('Error connecting to Workcell\'s ROSCORE on '+ip_workcell+'.');
    });

    ros_workcell.on('close', function() {
        wc_ros_disconnected();
    });

    // Topics on Workcell's CORE
    wc_tp_ui_str_control = new ROSLIB.Topic({
        ros : ros_workcell,
        name : '/ui/str_control_workcell',
        messageType : 'std_msgs/String'
    });

    wc_tp_automode = new ROSLIB.Topic({
        ros : ros_workcell,
        name : '/ui/wc_automode',
        messageType : 'std_msgs/Bool'
    });

    wc_tp_usbcam = new ROSLIB.Topic({
        ros : ros_workcell,
        name : '/usb_cam/image_raw/compressed',
        messageType : 'sensor_msgs/CompressedImage'
    });

    wc_tp_mes_control = new ROSLIB.Topic({
        ros : ros_workcell,
        name : '/ui/mes',
        messageType : 'std_msgs/Int8'
    });

    belt_tp_automode = new ROSLIB.Topic({
        ros : ros_workcell,
        name : '/ui/belt_automode',
        messageType : 'std_msgs/Bool'
    });

    belt_tp_activated = new ROSLIB.Topic({
        ros : ros_workcell,
        name : '/ui/belt_activated',
        messageType : 'std_msgs/Bool'
    });

    belt_tp_forward = new ROSLIB.Topic({
        ros : ros_workcell,
        name : '/ui/belt_forward',
        messageType : 'std_msgs/Bool'
    });

    belt_tp_speed = new ROSLIB.Topic({
        ros : ros_workcell,
        name : '/ui/belt_speed',
        messageType : 'std_msgs/Int8'
    });

    // Workcell control mode
    wc_tp_automode.subscribe(function(message) {
        wc_got_mode(message);
    });

    // Image from WC usbcam
    /*wc_tp_usbcam.subscribe(function(message) {
        document.getElementById("cam_wc_img").src = "data:image/png;base64,"+message.data;
    });*/

    // Belt control mode
    belt_tp_automode.subscribe(function(message) {
        belt_got_mode(message);
    });

    // Belt status
    belt_tp_activated.subscribe(function(message) {
        belt_got_status(message);
    });

    // Belt direction
    belt_tp_forward.subscribe(function(message) {
        belt_got_direction(message);
    });

    // Belt speed
    belt_tp_speed.subscribe(function(message) {
        belt_got_speed(message);
    });

    // Services on WC core
    wc_srv_getconf = new ROSLIB.Service({
        ros : ros_workcell,
        name : '/KukaNode/GetConfiguration',
        serviceType: 'kuka_ros/getConfiguration'
    });

    wc_srv_setconf = new ROSLIB.Service({
        ros : ros_workcell,
        name : '/KukaNode/SetConfiguration',
        serviceType: 'kuka_ros/setConfiguration'
    });

    wc_srv_topics = new ROSLIB.Service({
        ros : ros_workcell,
        name : '/rosapi/topics',
        serviceType : 'rosapi/Topics'
    });

    wc_srv_nodes = new ROSLIB.Service({
        ros : ros_workcell,
        name : '/rosapi/nodes',
        serviceType : 'rosapi/Nodes'
    });

    wc_srv_services = new ROSLIB.Service({
        ros : ros_workcell,
        name : '/rosapi/services',
        serviceType : 'rosapi/Services'
    });

    // Monitor Workcell's ROS structure, [ms]
    wc_monitor_interval = setInterval(wc_update_ros_structure, 1000);

    // Update Kuka configuration every 50 ms
    wc_kuka_conf_interval = setInterval(wc_call_srv_getconf, 50);
}

function wc_got_ip() {
    document.getElementById('wc_monitor_ip').innerHTML = ip_workcell;
    document.getElementById('belt_monitor_ip').innerHTML = ip_workcell;
    console.log('Workcell IP: '+ip_workcell);
}

function wc_ros_connected() {
    // Connected Indication
    document.getElementById("onoff_workcell").checked = 'checked';
    document.getElementById("wc_monitor_ip").style.backgroundColor = 'LightGreen';
    document.getElementById("belt_monitor_ip").style.backgroundColor = 'LightGreen';

    // Enable control of Kuka
    document.getElementById("wc_manual_control_frame").style.opacity = 1.0;
    document.getElementById("img_safety_button_wc").style.cursor = "pointer";
    document.getElementById("wc_man_auto_switch").disabled = '';
    wc_enable_manual_control();


    // Enable control of Belt
    document.getElementById("belt_manual_control_frame").style.opacity = 1.0;
    document.getElementById("img_safety_button_belt").style.cursor = "pointer";
    document.getElementById("belt_man_auto_switch").disabled = '';
    document.getElementById("belt_on_off_switch").disabled = '';
    document.getElementById("belt_direction_switch").disabled = '';
    document.getElementById("belt_speed_switch").disabled = '';

    // Console Info
    console.log('Connected to Workcell\'s ROSCORE on '+ip_workcell+'.');
    to_console('Connected to Workcell\'s ROSCORE on '+ip_workcell+'.');
}

function wc_ros_disconnected() {
    // Workcell Monitoring
    document.getElementById("wc_monitor_mode").innerHTML = "&nbsp;";
    document.getElementById("wc_monitor_mission").innerHTML = "&nbsp;";
    wc_erase_monitor_conf();

    // Workcell Control Options
    document.getElementById("wc_manual_control_frame").style.opacity = 0.5;
    document.getElementById("img_safety_button_wc").src = "img/cant_read_workcell.png";
    document.getElementById("img_safety_button_wc").onclick = ""
    document.getElementById("img_safety_button_wc").style.cursor = "wait";
    document.getElementById("wc_man_auto_switch").disabled = 'disabled';
    wc_disable_manual_control();


    // Belt Monitoring
    document.getElementById("belt_monitor_mode").innerHTML = "&nbsp;";
    document.getElementById("belt_monitor_status").innerHTML = "&nbsp;";
    document.getElementById("belt_monitor_direction").innerHTML = "&nbsp;";
    document.getElementById("belt_monitor_speed").innerHTML = "&nbsp;";

    // Belt Control Options
    document.getElementById("belt_manual_control_frame").style.opacity = 0.5;
    document.getElementById("img_safety_button_belt").src = "img/cant_read_belt.png";
    document.getElementById("img_safety_button_belt").onclick = ""
    document.getElementById("img_safety_button_belt").style.cursor = "wait";
    document.getElementById("belt_man_auto_switch").disabled = 'disabled';
    document.getElementById("belt_on_off_switch").disabled = 'disabled';
    document.getElementById("belt_direction_switch").disabled = 'disabled';
    document.getElementById("belt_speed_switch").disabled = 'disabled';

    // Disconnected Indication
    document.getElementById("onoff_workcell").checked = '';
    document.getElementById("wc_monitor_ip").style.backgroundColor = 'Red';
    document.getElementById("belt_monitor_ip").style.backgroundColor = 'Red';

    // Stop Intervals
    clearInterval(wc_monitor_interval);
    clearInterval(wc_kuka_conf_interval);

    // Console Info
    console.log('Connection to Workcell\'s ROSCORE on '+ip_workcell+' closed.');
    to_console('Connection to Workcell\'s ROSCORE on '+ip_workcell+' closed.');
}

/* Publish control for Workcell */
function wc_ros_msg(data_str) {
    var msg = new ROSLIB.Message({data : data_str});
    wc_tp_ui_str_control.publish(msg);
    console.log(msg);
    to_console('To Workcell: '+msg.data);
}

/* This function is being run in a loop, it updates Kuka's configuration */
function wc_call_srv_getconf() {
    try {
        wc_srv_getconf.callService(new ROSLIB.ServiceRequest(), function(result) {
            current_kuka_configuration = result.q;
            wc_update_kuka_configuration();
            kuka_deadman = true;
            wc_enable_manual_control();
        });
    } catch (err) {
        kuka_deadman = false;
        wc_disable_manual_control();
        wc_erase_monitor_conf();
        console.log(err.message);
    }
}

function wc_call_srv_setconf(new_conf_deg) {
    if (kuka_deadman) {
        new_conf_rad = deg_to_rad(new_conf_deg);
        var request = new ROSLIB.ServiceRequest({
            q : new_conf_rad,
            speed : [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            acc : [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        });
        wc_srv_setconf.callService(request, function(result) {
            to_console('New conf sent [rad]: '+new_conf_rad);
        });
    } else {
        to_console('You cannot set Kuka configuration, because you have failed to read it.');
    }
}

/* This function is being run in a loop, it monitors ROS structures */
function wc_update_ros_structure() {
    try {
        wc_srv_topics.callService(new ROSLIB.ServiceRequest(), function(result) {
            var topics_workcell_str = '';
            for (var i in result.topics) {
              topics_workcell_str += result.topics[i]+'<br />';
            }
            document.getElementById('ros_wc_topics').innerHTML = topics_workcell_str;
        });
        wc_srv_nodes.callService(new ROSLIB.ServiceRequest(), function(result) {
            var nodes_workcell_str = '';
            for (var i in result.nodes) {
              nodes_workcell_str += result.nodes[i]+'<br />';
            }
            document.getElementById('ros_wc_nodes').innerHTML = nodes_workcell_str;
        });
        wc_srv_services.callService(new ROSLIB.ServiceRequest(), function(result) {
            var services_workcell_str = '';
            for (var i in result.services) {
              services_workcell_str += result.services[i]+'<br />';
            }
            document.getElementById('ros_wc_services').innerHTML = services_workcell_str;
        });
    } catch (err) {
        console.log(err.message);
    }
};

function wc_on_mes_change(value) {
    var msg = new ROSLIB.Message({data : value});
    wc_tp_mes_control.publish(msg);
}