var bcrypt = require("bcrypt-nodejs");

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    firstname: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    picture: {
      type: DataTypes.STRING,
      // allowNull: false,
      validate: {
        isUrl: true
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    // The password cannot be null
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue:DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue:DataTypes.NOW
    }
  }, {
    // classMethods: {
    //   associate: function(models) {
    //     // associations can be defined here
    //     User.hasMany(models.Trip, {
    //         onDelete: "cascade"
    //     });
    //   }
    // },
    instanceMethods: {
      validPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
      }
    },
    // Hooks are automatic methods that run during various phases of the User Model lifecycle
    // In this case, before a User is created, we will automatically hash their password
    hooks: {
      beforeCreate: function(user, options) {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
      }
    }
  });

  User.sync({
    force:false
  });
  
  return User;
};