#include <pebble.h>
#include "transit.h"

// setup pebblekitjs to add stop
static void inbox_received_callback(DictionaryIterator *iterator, void *context) {
    // message keys are Stop_Name, Stop_Next_Time_Minutes, Stop_Destination, Stop_Color, Stop_Highlight_Color

    Tuple *refresh_menu_tuple = dict_find(iterator, MESSAGE_KEY_RefreshMenu);
    if (refresh_menu_tuple) {
        refresh_menu();
        return;
    }

    Tuple *name_tuple = dict_find(iterator, MESSAGE_KEY_Stop_Name);
    Tuple *next_time_tuple = dict_find(iterator, MESSAGE_KEY_Stop_Next_Time_Minutes);
    Tuple *destination_tuple = dict_find(iterator, MESSAGE_KEY_Stop_Destination);
    Tuple *color_tuple = dict_find(iterator, MESSAGE_KEY_Stop_Color);
    Tuple *highlight_color_tuple = dict_find(iterator, MESSAGE_KEY_Stop_Highlight);

    // Convert colors to HEX int, then color
    GColor color = GColorFromHEX(color_tuple->value->int32);
    GColor highlight_color = GColorFromHEX(highlight_color_tuple->value->int32);

    // Log destination, time and name
    APP_LOG(APP_LOG_LEVEL_DEBUG, "Stop: %s, Destination: %s", name_tuple->value->cstring, destination_tuple->value->cstring);

    // Convert tuple to int/char
    char *name = name_tuple->value->cstring;
    int next_time = next_time_tuple->value->int32;
    char *destination = destination_tuple->value->cstring;


    // Add the stop to the list
    transit_add_stop(name, next_time, destination, color, highlight_color);    
}

// on fail
static void outbox_failed_callback(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox send failed: %d", (int)reason);
}
// ask pebblekitjs for stops
static void send_request_for_stops(void) {
    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
    dict_write_uint8(iter, MESSAGE_KEY_RequestStops, 1);
    app_message_outbox_send();
}

static void init(void) {
    app_message_register_inbox_received(inbox_received_callback);
    app_message_register_outbox_failed(outbox_failed_callback);
    app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
    send_request_for_stops();
    transit_init();
}

static void deinit(void) {
    transit_deinit();
    // remove app message handlers
    app_message_deregister_callbacks();

}

int main(void) {
    init();
    app_event_loop();
    deinit();
}
