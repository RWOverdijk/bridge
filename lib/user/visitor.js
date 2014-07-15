define(['../core/transport/main', './identity'], function (transport, identity) {
  var visitorIdentity = null;

  return {

    /**
     * Get the user's identity. Contains user information such as credit count.
     *
     * @param {Function} callback
     * @returns {*}
     */
    getIdentity: function (callback) {
      if (visitorIdentity) {
        return callback(null, visitorIdentity);
      }

      identity.getIdentity('visitor', function (error, userIdentity) {
        if (error) {
          return callback(error);
        }

        if (typeof userIdentity.visitor === 'object') {
          visitorIdentity = userIdentity.visitor;

          return callback(null, visitorIdentity);
        }

        // Okay so, our record didn't get populated. Force update.
        identity.getIdentity('visitor', function (error, userIdentity) {
          if (error) {
            return callback(error);
          }

          visitorIdentity = userIdentity.visitor;

          callback(null, visitorIdentity);
        }, true);

      });
    },

    /**
     * Get the amount of credits the authenticated visitor has.
     *
     * @param {Function} callback The method called after getting the credits
     */
    getCredits: function (callback) {
      this.getIdentity(function (error, identity) {
        if (error) {
          return callback(error);
        }

        callback(null, identity.credits);
      });
    },

    /**
     * Login a visitor.
     *
     * @param {String}   username
     * @param {String}   password
     * @param {Function} callback
     */
    login: function (username, password, callback) {
      identity.login('visitor', username, password, function (error, response) {
        if (error) {
          return callback(error);
        }

        visitorIdentity = response.visitor;

        callback(response);
      });
    },

    /**
     * Check if the visitor has a username.
     *
     * @param {Function} callback The method called after checking if visitor has a username
     */
    hasUsername: function (callback) {
      this.getIdentity(function (error, identity) {
        if (error) {
          return callback(error);
        }

        callback(null, !!identity.username);
      });
    },

    getUserId: function (callback) {
      this.getIdentity(function (error, identity) {
        if (error) {
          return callback(error);
        }

        callback(null, identity.id);
      });
    },

    setUsername: function (username, callback) {
      this.getUserId(function (error, id) {
        if (error) {
          return callback(error);
        }

        transport.connection.put('/visitor/username', {username: username}, function (response) {
          if (response.error) {
            return callback(error);
          }

          callback(null, username);
        });
      });
    }
  };
});