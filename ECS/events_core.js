// This file holds all events that are built in and the Event class itself.

class Event {} // The base class for all events.

class Startup extends Event {}
class NeverEvent extends Event {}

class PreUpdate extends Event {}
class Update extends Event {}
class PostUpdate extends Event {}

class PreRender extends Event {}
class Render extends Event {}

class FrameStart extends Event {}
class FrameEnd extends Event {}