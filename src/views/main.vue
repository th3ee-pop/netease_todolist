<template>
<section :class="$style.banner">
    <div :class="$style.bannerContent">
        <h2 :class="$style.subtitle">th3ee的备忘录</h2>
    </div>
    <div :class="$style.bannerList">
        <div :class="$style.flexRightDiv">
            <u-date-picker :date="time" @change="changeTime"></u-date-picker>
            <u-pills value="all" @select="changeStatus($event.value)">
                <u-pill value="all">全部</u-pill>
                <u-pill value="0">{{ `待完成(${incompleted})` }}</u-pill>
                <u-pill value="1">已完成</u-pill>
            </u-pills>
        </div>
        <br>
        <u-linear-layout>
            <u-input :class="$style.wideInput" placeholder="此处输入待办事项" @keyup.enter="addNewItem" v-model="newItem" size="normal-medium" value="large"></u-input>
            <u-spinner :class="$style.loading" v-if="loading"></u-spinner>
            <a :class="$style.deleteCompleted" @click="deleteCompleted">清除已完成事项</a>
        </u-linear-layout>
        <u-list-view cancelable>
            <u-list-view-item v-for="(item, index) in items" :key="index" :class="{[$style.finished]: item.isFinished}">
                <u-checkbox v-model="item.isFinished" @change="updateItem(item.id, $event.value)"></u-checkbox>
                    {{ item.label }}
                <a :class="$style.close" @click="deleteItem(item.id)" title="删除">
                </a>
            </u-list-view-item>
        </u-list-view>
        <u-block v-if="items.length === 0">暂无事项</u-block>
    </div>
</section>
</template>

<style module>
.banner {
    height: 480px;
    background: #f0f6fa;
    color: #676975;
}

.wideInput {
    width: 100%;
    margin-bottom: 5px;
}

.bannerContent {
    width: 680px;
    margin: 0 auto;
    padding: 80px;
}

.bannerList {
    width: 680px;
    margin: 0 auto;
    padding: 20px 80px;
}

.flexRightDiv {
    display: flex;
    justify-content: space-between;
}

.heading {
    font-size: 52px;
    font-weight: normal;
    margin-bottom: 20px;
}

.subtitle {
    font-size: 28px;
    font-weight: normal;
    margin: 0;
}

.finished {
    text-decoration: line-through;
    color: gray;
}

.close {
    float: right;
    line-height: 1;
    color: #bbb;
    padding-top: 3px;
}

.close:hover {
    color: #888;
}

.deleteCompleted {
    padding-top: 8px;
    cursor: pointer;
    float: right;
    color: #bbb;
}

.deleteCompleted:hover {
    color: #888;
}

.close::before {
    icon-font: url("../components/cloud-ui/u-icon.vue/icons/close.svg");
    font-size: 10px;
}
    .loading {
        padding-left: 3px;
    }
</style>
<script>
import UInput from 'cloud-ui.vusion/src/u-input.vue';
import UBlock from 'cloud-ui.vusion/src/u-block.vue';
export default {
    components: { UBlock, UInput },
    data() {
        return {
            items: [
            ],
            newItem: '',
            time: '',
            status: 'all',
            loading: false,
            incompleted: 0,
        };
    },
    methods: {
        async addNewItem() {
            if (this.newItem === '') {
                this.$toast.position = 'bottom-center';
                this.$toast.show('事项不能为空');
            } else {
                const data = { item_name: this.newItem, item_date: this.time };
                this.loading = true;
                await this.$http.post('http://202.117.54.45:8081/oa/todolist', JSON.stringify(data)).then((res) => {
                    console.log(res);
                }, (err) => {
                    console.log(err);
                });
                this.loading = false;
                this.newItem = '';
                this.getItems(this.status);
            }
        },
        async getItems(status) {
            await this.$http.get(`http://202.117.54.45:8081/oa/todolist/${this.time}/${status}`)
                .then((res) => {
                    this.incompleted = res.body.inCompleted;
                    this.items = res.body.data.map((item) => {
                        return { id: item.item_id, label: item.item_name, isFinished: item.item_status };
                    });
                });
        },
        changeStatus(status) {
            this.status = status;
            this.getItems(status);
        },
        changeTime(val) {
            if (val) {
                const year = val.date.getFullYear();
                const month = val.date.getMonth() + 1 > 9 ? `${val.date.getMonth() + 1}` : `0${val.date.getMonth() + 1}`;
                const day = val.date.getDate() > 9 ? `${val.date.getDate()}` : `0${val.date.getDate()}`;
                this.time = `${year}-${month}-${day}`;
            } else {
                const startDate = new Date();
                const year = startDate.getFullYear();
                const month = startDate.getMonth() + 1 > 9 ? `${startDate.getMonth() + 1}` : `0${startDate.getMonth() + 1}`;
                const day = startDate.getDate() > 9 ? `${startDate.getDate()}` : `0${startDate.getDate()}`;
                this.time = `${year}-${month}-${day}`;
            }
            this.getItems('all');
        },
        async deleteItem(id) {
            await this.$http.delete(`http://202.117.54.45:8081/oa/todolist/${id}`)
                .then((res) => {
                    console.log(res);
                });
            this.getItems(this.status);
        },
        async updateItem(id, value) {
            await this.$http.put(`http://202.117.54.45:8081/oa/todolist/${id}/${value ? '1' : '0'}`).then((res) => {
                console.log(res);
            });
            this.getItems(this.status);
        },
        async deleteCompleted() {
            await this.$http.delete(`http://202.117.54.45:8081/oa/delete_completed/${this.time}`)
                .then((res) => {
                    console.log(res);
                });
            this.getItems(this.status);
        },
    },
    mounted() {
        this.changeTime();
        this.getItems('all');
    },
};
</script>
