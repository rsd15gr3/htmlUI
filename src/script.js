function to_console(text) {
    var textarea = document.getElementById("textarea_console");
    textarea.value += "\n=> "+text;
    textarea.scrollTop = textarea.scrollHeight;
}

function on_loaded_page() {
    document.getElementById("onoff_mes").checked = 'checked'; // this how to set the button checked
    to_console('Website loaded.')
}

function manual_button_pressed(direction) {
    // TODO : DOES NOT WORK PERFECTLY YET
    // Read current velocities
    cmd_vel_topic.subscribe(function(message) {
        console.log('Received message on ' + cmd_vel_topic.name);
        if(message.data){
            current_vel_lin = message.twist.linear.x;
            current_vel_ang = message.twist.angular.z;
        }
      });

    // Adjust velocity and publish
    switch (direction) {
        case 'up':
            to_console('forward button pressed');
            current_vel_lin += vel_lin_step;
            break;
        case 'right':
            to_console('right button pressed');
            current_vel_ang += vel_ang_step;
            break;
        case 'left':
            to_console('left button pressed');
            current_vel_ang -= vel_ang_step;
            break;
        case 'down':
            to_console('down button pressed');
            current_vel_lin -= vel_lin_step;
            break;
    }

    var vel_msg = new ROSLIB.Message({
        twist : {
            linear : {
              x : current_vel_lin,
              y : 0,
              z : 0
            },
            angular : {
              x : 0,
              y : 0,
              z : current_vel_ang
            }
        }
    });

    cmd_vel_topic.publish(vel_msg);
    console.log(vel_msg)
}