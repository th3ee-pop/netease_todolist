import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
Vue.use(VueRouter);
Vue.use(VueResource);
import * as Components from 'library';
import { install } from 'vusion-utils';
install(Components, Vue);

import routes from './routes';

new Vue({
    el: '#app',
    router: new VueRouter({
        routes,
    }),
});
