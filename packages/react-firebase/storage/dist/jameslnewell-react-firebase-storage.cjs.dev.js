'use strict';

Object.defineProperty(exports, '__esModule', {value: true});

var React = require('react');
var app_dist_jameslnewellReactFirebaseApp = require('../../app/dist/jameslnewell-react-firebase-app.cjs.dev.js');
var objectSpread2 = require('../../dist/objectSpread2-fabd6420.cjs.dev.js');
var firebase = require('firebase');

function _interopDefault(e) {
  return e && e.__esModule ? e : {default: e};
}

var firebase__default = /*#__PURE__*/ _interopDefault(firebase);

function getStatus(state) {
  if (state.error) {
    return 'errored';
  } else if (state.url) {
    return 'loaded';
  } else {
    return 'loading';
  }
}

function useUrl(path) {
  var app = app_dist_jameslnewellReactFirebaseApp.useApp();

  var _useState = React.useState({}),
    _useState2 = objectSpread2._slicedToArray(_useState, 2),
    state = _useState2[0],
    setState = _useState2[1];

  React.useEffect(
    function () {
      // reset the state whenever app or path changes
      setState({}); // fetch the data

      app
        .storage()
        .ref(path)
        .getDownloadURL()
        .then(
          function (url) {
            return setState({
              url: url,
              error: undefined,
            });
          },
          function (error) {
            return setState({
              error: error,
            });
          },
        );
    },
    [app, path],
  );
  return [
    state.url,
    {
      status: getStatus(state),
      error: state.error,
    },
  ];
}

function getStatus$1(state) {
  if (state.error) {
    return 'errored';
  } else if (state.metadata) {
    return 'loaded';
  } else {
    return 'loading';
  }
}

function useMetadata(path) {
  var app = app_dist_jameslnewellReactFirebaseApp.useApp();

  var _useState = React.useState({}),
    _useState2 = objectSpread2._slicedToArray(_useState, 2),
    state = _useState2[0],
    setState = _useState2[1];

  React.useEffect(
    function () {
      // reset the state whenever app or path changes
      setState({}); // fetch the data

      app
        .storage()
        .ref(path)
        .getMetadata()
        .then(
          function (metadata) {
            return setState({
              metadata: metadata,
            });
          },
          function (error) {
            return setState({
              error: error,
            });
          },
        );
    },
    [app, path],
  );
  return [
    state.metadata,
    {
      status: getStatus$1(state),
      error: state.error,
    },
  ];
}

function getStatus$2(state) {
  switch (state) {
    case firebase__default['default'].storage.TaskState.RUNNING:
      return 'uploading';

    case firebase__default['default'].storage.TaskState.PAUSED:
      return 'paused';

    case firebase__default['default'].storage.TaskState.SUCCESS:
      return 'uploaded';

    case firebase__default['default'].storage.TaskState.ERROR:
      return 'errored';

    case firebase__default['default'].storage.TaskState.CANCELED:
      return 'canceled';

    default:
      throw new Error('Invalid task state');
  }
}

function updated(snapshot) {
  var status = getStatus$2(snapshot.state);

  if (status === 'canceled' || status === 'errored') {
    throw new Error('Invalid state');
  } else {
    return {
      status: status,
      transferred: snapshot.bytesTransferred,
      total: snapshot.totalBytes,
    };
  }
}

function errored(snapshot, error) {
  var status = getStatus$2(snapshot.state);

  if (status === 'canceled' || status === 'errored') {
    return {
      status: status,
      error: error,
    };
  } else {
    throw new Error('Invalid state');
  }
}

function useUpload(path) {
  var app = app_dist_jameslnewellReactFirebaseApp.useApp();

  var _useState = React.useState({
      status: undefined,
    }),
    _useState2 = objectSpread2._slicedToArray(_useState, 2),
    state = _useState2[0],
    setState = _useState2[1];

  var _useState3 = React.useState(undefined),
    _useState4 = objectSpread2._slicedToArray(_useState3, 2),
    uploader = _useState4[0],
    setUploader = _useState4[1];

  var methods = {
    upload: function upload(file, metadata) {
      if (!app) {
        throw new Error('Firebase is not ready yet');
      } // get the uploader

      var ref = app.storage().ref(path);
      var task;

      if (typeof file === 'string') {
        task = ref.putString(file);
      } else {
        task = ref.put(file, metadata);
      }

      setUploader(task);
      setState(updated(task.snapshot)); // observe changes in state

      task.on(firebase__default['default'].storage.TaskEvent.STATE_CHANGED, {
        next: function next() {
          setState(updated(task.snapshot));
          setState(updated(task.snapshot));
        },
        error: function error(_error) {
          setUploader(undefined);
          setState(errored(task.snapshot, _error));
        },
        complete: function complete() {
          setUploader(undefined);
          setState(updated(task.snapshot));
        },
      });
    },
    canPause: function canPause() {
      return state.status === 'uploading';
    },
    pause: function pause() {
      if (!uploader) {
        throw new Error('File upload is not in progress.');
      }

      uploader.pause();
    },
    canResume: function canResume() {
      return state.status === 'paused';
    },
    resume: function resume() {
      if (!uploader) {
        throw new Error('File upload is not in progress.');
      }

      uploader.resume();
    },
    canCancel: function canCancel() {
      return state.status === 'uploading';
    },
    cancel: function cancel() {
      if (!uploader) {
        throw new Error('File upload is not in progress.');
      }

      uploader.cancel();
    },
  };
  return objectSpread2._objectSpread2(
    objectSpread2._objectSpread2({}, state),
    methods,
  );
}

exports.useMetadata = useMetadata;
exports.useUpload = useUpload;
exports.useUrl = useUrl;
