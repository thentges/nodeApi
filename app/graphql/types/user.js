import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLList
} from 'graphql';

import Quote from './quote.js';
import models from '../../models/index.js';

export default new GraphQLObjectType({
    name: 'user',
    description: 'owner of some post',
    fields () {
        return {
            id: {
                type: GraphQLID,
                description: "user's ID",
                resolve (user) {
                    return user.id;
                }
            },
            name: {
                type: GraphQLString,
                description: "user's name",
                resolve (user) {
                    return user.name;
                }
            },
            email: {
                type: GraphQLString,
                description: "user's email",
                resolve (user) {
                    return user.email;
                }
            }
            // ,quotes: {
            //     type: new GraphQLList(Quote),
            //     description: "user's quotes",
            //     resolve(user) {
            //         return models.quote.findAll({ where: { user_id: user.id } });
            //     }
            // }
        };
    }
});
