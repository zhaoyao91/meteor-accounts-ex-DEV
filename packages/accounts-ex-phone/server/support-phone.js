// support phone

/**
 * add fields below to Meteor.users (refer to emails)
 * phones - array
 * phones.$.number
 * phones.$.verified
 */

// add index
Meteor.users._ensureIndex({'phones.number': 1}, {unique: 1, sparse: 1});

// publish user phones
Meteor.publish(AccountsEx.publicationPrefix + 'phones', function () {
    if (this.userId) {
        return Meteor.users.find({_id: this.userId}, {fields: {phones: 1}});
    } else {
        this.ready();
    }
});