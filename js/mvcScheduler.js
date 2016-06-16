$(document).ready(function () {
   // Global Variables to Update Events
   var id = 1, edit = false, droppedEmpTitle = '';
   var editTitle = '', editDate = '', editHour = '', editMinute = '', editAmPm = '';
   var editYear = '', editMonth = '', editDay = '', editEvent = '';
   var hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
   var minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

   /*------------------------------------------------------------------------------------------*/
   /* Populate the Drop Down Lists for the Edit Dialog */
   /*------------------------------------------------------------------------------------------*/
   $.each(hours, function (index, value) {
      $('#editDialogHour').append($('<option>', {
         value: value,
         text: value
      }));
   });

   $.each(minutes, function (index, value) {
      $('#editDialogMinute').append($('<option>', {
         value: value,
         text: value
      }));
   });

   /*------------------------------------------------------------------------------------------*/
   /* Query the Database to Get All the Events */
   /*------------------------------------------------------------------------------------------*/
  //  $.ajax({
  //       type: "GET",
  //       dataType: "jsonp",
  //       url: "http://localhost:60245/api/PullEvents/GetEvents",
  //       success: function (response) {
  //           console.log(response);
  //       },
  //       error: function (response) {
  //           console.log('Error');
  //           console.log(response);
  //       }
  //   });

   /*------------------------------------------------------------------------------------------*/
   /* Clear the Employee Events List When the Dialog Closes */
   /*------------------------------------------------------------------------------------------*/
   $('#chooseCorrespondingEventDialog').on('hidden.bs.modal', function () {
      $('#correspondingEventsList').empty();
   });

   $('#editEventDialog').on('show.bs.modal', function () {
      // TODO: Figure Out Why the Focus is Not Setting on the Textbox Correctly
      $('#editDialogName').focus();
   });

   $('#saveChooseCorrespondingEventDialog').click(function () {
      // TODO: Figure Out How to Sort By orderId. Currently If More than One Event has the Same Time, the Employees do 
      // Not get Sorted Correctly with Their Corresponding Event

      // Add the Employee to the Event that was Selected in the Dialog
      var events = $('#calendar').fullCalendar('clientEvents');
      for (var i = 0; i < events.length; i++) {
         if (events[i].orderId == $('#correspondingEventsList').val() && events[i].type == 'event') {
            console.log(events[i]);

            var newEvent = {
               title: droppedEmpTitle,
               // TODO: Check Why editDate.format('M') Returns the Month Name One Month Ahead of What it Should Be
               start: new Date(events[i].start.format('YYYY'), parseInt(events[i].start.format('M')) - 1, events[i].start.format('D'),
                  events[i].start.format('hh'), events[i].start.format('mm'), parseInt(events[i].start.format('ss')) + 1, 1),
               orderId: events[i].orderId,
               color: '#257e4a',
               type: 'emp'
            };
            console.log(newEvent);
            // Render the Newly Created Event on the Calendar
            $('#calendar').fullCalendar('renderEvent', newEvent, 'stick');
         }
      }

      $('#chooseCorrespondingEventDialog').modal('hide');
   });

   /*------------------------------------------------------------------------------------------*/
   /* Make All the Necessary Updates When the User Enters the Event Information */
   /*------------------------------------------------------------------------------------------*/
   $('#saveEditEventDialog').click(function () {
      // Get the Information the User Entered Into the Dialog
      editTitle = $('#editDialogName').val();
      editHour = $('#editDialogHour').val();
      editMinute = $('#editDialogMinute').val();

      // Edit the Hour Depending on What the User Selected
      if ($('#editDialogAmPm').val() === 'PM')
         editHour = parseInt(editHour) + 12;
      if ($('#editDialogAmPm').val() === 'AM' && $('#editDialogHour').val() === '12')
         editHour = 0;
      if ($('#editDialogAmPm').val() === 'PM' && $('#editDialogHour').val() === '12')
         editHour = 12;

      // Determine If We Need to Edit an Event or Create a New Event
      if (edit) {
         // Update the Event Based on the User's Input
         editEvent.title = editTitle;
         editEvent.start = new Date(editEvent.start.format('YYYY'), editEvent.start.format('M') - 1, editEvent.start.format('D'), editHour, editMinute, 0, 0)

         $('#calendar').fullCalendar('updateEvent', editEvent);
         // Exit Edit Mode
         edit = false;
      }
      else {
         // Create a New Event Based on the Day that Was Clicked
         // Check editYear/editMonth/editDay Since we Can't Get the Date Object in the Event
         if (editYear === '' || editMonth === '' || editDay === '') {
            var newEvent = {
               title: editTitle,
               // TODO: Check Why editDate.format('M') Returns the Month Name One Month Ahead of What it Should Be
               start: new Date(editDate.format('YYYY'), editDate.format('M') - 1, editDate.format('D'), editHour, editMinute, 0, 0),
               orderId: id,
               type: 'event'
            };
            
            // Log the start time that should be entered into the database
            if(editHour < 10) {
              var hour = '0' + editHour;
            }
            else {
              var hour = editHour;
            }
            if(editMinute < 10) {
              var minute = '0' + editMinute;
            }
            else {
              var minute = editMinute;
            }
            console.log(editDate.format('YYYY') + '-' + editDate.format('MM') + '-' + editDate.format('DD') + 'T' + hour + ':' + minute + ':00');
         }
            // WorkAround for Creating Event from Plus Sign Click Since we Can't Get the Date Object in the Event
            // TODO: Determine if there is a Way to Get the Date Object from the Event Fired by the Plus Sign Click
         else {
            var newEvent = {
               title: editTitle,
               start: new Date(editYear, editMonth, editDay, editHour, editMinute, 0, 0),
               orderId: id,
               type: 'event'
            };

            // Reset the editYear/editMonth/editDay for the Next Event that is Fired
            editYear = '';
            editMonth = '';
            editDay = '';
         }
         // Render the Newly Created Event on the Calendar
         $('#calendar').fullCalendar('renderEvent', newEvent, 'stick');
         id++;
      }

      // Close the Dialog
      $("#editEventDialog").modal("hide");
      // Clear the Input Box for the Edit Dialog
      $('#editDialogName').val('');
   });

   /*--------------------------------------------------------------------------------------------*/
   /* Initialize the External Events */
   /*--------------------------------------------------------------------------------------------*/
   $('#external-events .fc-event').each(function () {

      // Store Data So the Calendar Knows to Render an Event Upon Drop
      $(this).data('event', {
         title: $.trim($(this).text()), // Use the Element's Text as the Default Event Title
         stick: true // Maintain When User Navigates (See Docs on the RenderEvent Method)
      });

      // Make the Event Draggable Using jQuery UI
      $(this).draggable({
         zIndex: 999,
         revert: true,      // Will Cause the Event to Go Back to its Original Position After the Drag
         revertDuration: 0
      });

   });

   /*---------------------------------------------------------------------------------------------*/
   /* Initialize the Calendar */
   /*---------------------------------------------------------------------------------------------*/
   $('#calendar').fullCalendar({
      header: {
         left: 'prev,next today',
         center: 'title',
         right: 'prev,next today'
      },
      editable: true,
      events: [
				{
					title: 'Testing Database',
					start: '2016-06-06T20:35:00',
          orderId: '1',
          type: 'event'
				}
			],
      droppable: true, // this allows things to be dropped onto the calendar
      eventOrder: 'orderId, start', // Set the events to order by the orderId

      /*-------------------------------------------------------------------------------------*/
      /* Event that is fired when a valid jQuery UI draggable has been dropped onto the calendar
      /*-------------------------------------------------------------------------------------*/
      drop: function (event, element) {
         //console.log('drop');
      },

      /*-----------------------------------------------------------------------------*/
      /* Event that is Fired When an External Element, Containing Event Data, is Dropped on the Calendar. */
      /*-----------------------------------------------------------------------------*/
      eventReceive: function (event, delta, revertFunc) {
         // Get All the Events From the Date Where the Event Was Dropped
         var currentDayEvents = [];
         var events = $('#calendar').fullCalendar('clientEvents');
         var dayEvents = 0;
         for (var i = 0; i < events.length; i++) {
            if (events[i].type === 'event' &&
              events[i].start.format('D') === event.start.format('D') &&
              events[i].start.format('M') === event.start.format('M') &&
              events[i].start.format('YYYY') === event.start.format('YYYY')) {

               // Add the Day's Events to the currentDayEvents Array
               currentDayEvents.push(events[i]);

               // Increment the Number of Events in the Day
               dayEvents++;

               // Add Events from the Day Dropped Into to the Employee Events List
               $('#correspondingEventsList').append($('<option>', {
                  value: events[i].orderId,
                  text: events[i].title + ' (' + events[i].start.format('MM') + '/' + events[i].start.format('DD') +
                     '/' + events[i].start.format('YYYY') + ' ' + events[i].start.format('HH') + ':' + events[i].start.format('mm') + ')'
               }));
            }
         }

         // Remove the Dropped Employee from the Calendar if there are No Events to Add the Employee to
         if (dayEvents == 0) {
            $('#calendar').fullCalendar('removeEvents', event.id);
            alert('There are No Events in the Day to Add an Employee to');
            return;
         }

         // Add the Event for the Dropped Employee to the Only Event in the Day
         if (dayEvents == 1) {
            // Create a New Event Since the Event Dropped Doesn't Seem to Keep the Date/Time Correctly
            // TODO: Figure Out Why Dropped Event Doesn't Track Date/Time Properly
            var newEvent = {
               title: event.title,
               // TODO: Check Why editDate.format('M') Returns the Month Name One Month Ahead of What it Should Be
               start: new Date(currentDayEvents[0].start.format('YYYY'), parseInt(currentDayEvents[0].start.format('M')) - 1, currentDayEvents[0].start.format('D'),
                  currentDayEvents[0].start.format('hh'), currentDayEvents[0].start.format('mm'), parseInt(currentDayEvents[0].start.format('ss')) + 1, 1),
               orderId: currentDayEvents[0].orderId,
               color: '#257e4a',
               type: 'emp'
            };

            // Render the Newly Created Event on the Calendar
            $('#calendar').fullCalendar('renderEvent', newEvent, 'stick');

            // Remove the Dropped Event
            $('#calendar').fullCalendar('removeEvents', event._id);
            return;
         }

         // Show the Employee Dialog If there is More than One in the Day
         if (dayEvents > 1) {
            // Remove the Dropped Event
            $('#calendar').fullCalendar('removeEvents', event._id);
            droppedEmpTitle = event.title;

            $('#chooseCorrespondingEventDialog').modal('show');
         }
      },

      /*-------------------------------------------------------------------------------------*/
      /* Event that is Fired When Dragging Stops And the Event has Moved to a Different Day/Time. */
      /*-------------------------------------------------------------------------------------*/
      eventDrop: function (event, delta, reverFunc) {
         //console.log(event.title + " was dropped on " + event.start.format());
      },

      /*-------------------------------------------------------------------------------------*/
      /* Event that is Fired When the User Clicks On a Day
      /*-------------------------------------------------------------------------------------*/
      dayClick: function (date, allDay, jsEvent, view) {
         // console.log('click');
      },

      /*-------------------------------------------------------------------------------------*/
      /* Event that is Fired When the User Click on an Event
      /*-------------------------------------------------------------------------------------*/
      eventClick: function (event, jsEvent, view) {
         $(this).css('border-color', 'yellow');

         // TODO: Add Logic to Keep Track of the Selected Event
      },

      /*-------------------------------------------------------------------------------------*/
      /* Event that is Fired When the User Double Clicks On a Day
      /*-------------------------------------------------------------------------------------*/
      dayRender: function (date, element) {
         element.bind('dblclick', function () {
            // Set the Date that is Going to be Edited to the Date that was Clicked On
            editDate = date;
            edit = false;

            // Set the Default Values in the Edit Dialog
            $('#editDialogName').val('');
            $('#editDialogHour').val('1');
            $('#editDialogMinute').val('0');
            $('#editDialogAmPm').val('AM');

            // Open the Edit Dialog so the User Can Set Their Event Attributes
            //$("#editDialog").dialog({ modal: true, show: 'fade', hide: 'drop' });
            $('#editEventDialog').modal('show');
         });
      },

      /*-------------------------------------------------------------------------------------*/
      /* Event that is Fired When the User Double Clicks On an Event
      /*-------------------------------------------------------------------------------------*/
      eventRender: function (event, element) {
         element.bind('dblclick', function () {
            // Set the Date that is Going to be Edited to the Date that was Clicked On
            editEvent = event;
            edit = true;

            // Set the Values of the Event that was Clicked On in the Edit Dialog
            $('#editDialogName').val(event.title);
            $('#editDialogHour').val(event.start.format('h'));
            $('#editDialogMinute').val(event.start.format('m'));
            $('#editDialogAmPm').val(event.start.format('A'));

            // Open the Edit Dialog so the User Can Set Their Event Attributes
            $('#editEventDialog').modal('show');
         });
      },

      /*-------------------------------------------------------------------------------------*/
      /* Event that is Fired When the Calendar is Rendered
      /*-------------------------------------------------------------------------------------*/
      viewRender: function () {
         // Insert the Plus Sign in the Day Header to Use to Add Event
         $('.fc-basic-view td.fc-day-number').append("<span class='glyphicon glyphicon-plus plus-symbol'></span><span class='glyphicon glyphicon-minus minus-symbol'></span>");

         // Fade In the Header Elements When the User's Mouse Enters the Day Header
         $('.fc-basic-view td.fc-day-number').mouseenter(function () {
            $(this).children().fadeIn();
         });

         // Fade Out the Header Elements When the User's Mouse Leaves the Day Header
         $('.fc-basic-view td.fc-day-number').mouseleave(function () {
            $(this).children().fadeOut();
         });

         /*-------------------------------------------------------------------------------------*/
         /* Event that is Fired When the User Clicks the Plus Sign to Add Event
         /*-------------------------------------------------------------------------------------*/
         $('.plus-symbol').click(function () {

            // Get the Date Corresponding to the Plus Sign that was Clicked    
            var date = $(this).closest('td').attr("data-date");

            // Use Moment.js to Get the Year/Month/Day    
            editYear = moment(String(date), "YYYY/MM/DD").year();
            editMonth = moment(String(date), "YYYY/MM/DD").month();
            editDay = moment(String(date), "YYYY/MM/DD").date();

            edit = false;

            // Set the Default Values in the Edit Dialog
            $('#editDialogName').val('');
            $('#editDialogHour').val('1');
            $('#editDialogMinute').val('0');
            $('#editDialogAmPm').val('AM');

            // Open the Edit Dialog so the User Can Set Their Event Attributes
            $('#editEventDialog').modal('show');
         });
      }
   });
});