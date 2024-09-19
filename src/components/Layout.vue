<template>
  <div class="container mx-auto mb-20">

    <TransitionRoot appear :show="isOpenModalNotFound" as="template">
      <Dialog as="div" @close="closeModalNotFound" class="relative z-10">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div
            class="flex min-h-full items-center justify-center p-4 text-center"
          >
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900"
                >
                  No se encontró la tarea a editar
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Posiblemente se elimino antes de poder editar, si no es así consulte con el administrador.
                  </p>
                </div>

                <div class="mt-4 flex justify-end">
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="closeModalNotFound"
                  >
                    Continuar
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <h1 class="text-center text-4xl m-10 font-bold text-black">Mini administrador de <span class="text-blue-600">tareas</span></h1>

    <div class="md:flex gap-14 my-10">
      <div class="md:w-1/2">
        <h2 class="text-xl font-bold text-blue-600 uppercase text-center" v-if="isEditing && !taskForm.status">Editar Tarea</h2>
        <h2 class="text-xl font-bold text-blue-600 uppercase text-center" v-else>Agregar</h2>
        <div class="mt-3 border rounded p-4">
          <form @submit.prevent="submitTask">
            <div class="flex justify-between mb-1 cursor-pointer" @click="resetForm()" title="Limpiar formulario">
              <label class="font-bold text-base" for="title">Titulo</label>
              <span v-if="isEditing && !taskForm.status" class="material-icons-outlined">restart_alt</span>
            </div>
            <p class="text-red-600 font-md" v-if="errors.title">{{ errors.title[0] }}</p>
            <input id="title" v-model="taskForm.title" type="text" placeholder="Título"  class="border p-2 w-full mb-2"/>
            <label class="font-bold text-base mb-1" for="description">Descripción</label>
            <p class="text-red-600 font-md" v-if="errors.description">{{ errors.description[0] }}</p>
            <textarea id="description" v-model="taskForm.description" placeholder="Descripción"  class="border p-2 w-full mb-2"></textarea>
            <button type="submit" class="rounded shadow p-2 bg-blue-400 hover:bg-blue-600 text-white font-bold w-full">
              <span>{{ isEditing && !taskForm.status ? 'Actualizar' : 'Agregar' }} tarea</span>
            </button>
          </form>
        </div>
      </div>

      <div class="mt-8 md:mt-0 md:w-1/2">
        <h2 class="text-2xl text-center font-bold text-blue-600">Tareas</h2>

        <div v-if="getTaskPending.length > 0" class="h-full max-h-96 overflow-auto mt-3">
          <div v-for="(task) in getTaskPending" :key="task.id" class="my-2">
            <div class="border rounded-xl shadow mb-2">
              <div class="flex border-b border-gray-300 rounded-b-md pl-3 pr-1 py-1 justify-between">
                <h4 class="font-bold">{{ task.title }}</h4>
                <div class="flex items-center">
                  <p
                    @mouseover="hoverStatus = task.id"
                    @mouseleave="hoverStatus = null"
                    @click="completedTask(task)"
                    :class="hoverStatus === task.id ? 'bg-green-500' : 'bg-blue-500'"
                    class="mb-0 border rounded px-1 text-white cursor-pointer"
                  >
                  {{ hoverStatus === task.id ? 'Completar' : 'Pendiente' }}
                  </p>

                  <Menu as="div" class="relative inline-block text-left">
                    <MenuButton class="flex items-center">
                      <span class="material-icons-outlined">more_vert</span>
                    </MenuButton>
                    <transition
                      enter-active-class="transition duration-100 ease-out"
                      enter-from-class="transform scale-95 opacity-0"
                      enter-to-class="transform scale-100 opacity-100"
                      leave-active-class="transition duration-75 ease-in"
                      leave-from-class="transform scale-100 opacity-100"
                      leave-to-class="transform scale-95 opacity-0"
                    >
                      <MenuItems
                        class="z-10 absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                      >
                        <div class="px-1 py-1">
                          <MenuItem v-slot="{ active }">
                            <button
                              @click="editTask(task)"
                              :class="[
                                active ? 'bg-blue-500 text-white' : 'text-gray-900',
                                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                              ]"
                            >
                            <span :class="active ? 'text-white' : 'text-blue-400'" class="mr-2 text-lg material-icons-outlined">edit</span>
                              Editar
                            </button>
                          </MenuItem>
                          <MenuItem v-slot="{ active }">
                            <button
                              @click="deleteTask(task.id)"
                              :class="[
                                active ? 'bg-red-500 text-white' : 'text-gray-900',
                                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                              ]"
                            >
                              <span :class="active ? 'text-white' : 'text-red-600'" class="mr-2 text-lg material-icons-outlined">clear</span>
                              Eliminar
                            </button>
                          </MenuItem>
                        </div>
                      </MenuItems>
                    </transition>
                  </Menu>
                </div>
              </div>

              <div class="p-3 h-full max-h-20 overflow-auto">
                <p>{{ task.description }}</p>
              </div>

            </div>
          </div>
        </div>

        <div v-else class="my-4">
          <p class="text-3xl text-center font-bold text-gray-600">No tiene tareas pendientes</p>
        </div>
      </div>



    </div>

    <div v-if="getTaskCompleted.length > 0" class="mt-8">
      <div class="md:w-100 h-[550px]">
        <h2 class="text-2xl text-center font-bold text-green-500 mb-5">Completadas</h2>

        <div class="h-full max-h-[550px] overflow-auto">
          <div v-for="(task) in getTaskCompleted" :key="task.id" class="my-4">
            <div class="border rounded-xl shadow mb-2">
              <div class="flex border-b border-gray-300 rounded-b-md pl-3 pr-1 py-1 justify-between">
                <h4 class="font-bold">{{ task.title }}</h4>
                <div class="flex items-center">
                  <p
                    @mouseover="hoverStatus = task.id"
                    @mouseleave="hoverStatus = null"
                    @click="pendingTask(task)"
                    :class="hoverStatus === task.id ? 'bg-blue-500' : 'bg-green-500'"
                    class="mb-0 border rounded px-1 text-white cursor-pointer"
                  >
                  {{ hoverStatus === task.id ? 'Pasar a pendiente' : 'Completada' }}
                  </p>

                  <Menu as="div" class="relative inline-block text-left z-10">
                    <MenuButton class="flex items-center">
                      <span class="material-icons-outlined">more_vert</span>
                    </MenuButton>
                    <transition
                      enter-active-class="transition duration-100 ease-out"
                      enter-from-class="transform scale-95 opacity-0"
                      enter-to-class="transform scale-100 opacity-100"
                      leave-active-class="transition duration-75 ease-in"
                      leave-from-class="transform scale-100 opacity-100"
                      leave-to-class="transform scale-95 opacity-0"
                    >
                      <MenuItems
                        class="z-10 absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                      >
                        <div class="px-1 py-1">
                          <MenuItem v-slot="{ active }">
                            <button
                              @click="editTask(task)"
                              :class="[
                                active ? 'bg-blue-500 text-white' : 'text-gray-900',
                                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                              ]"
                            >
                            <span :class="active ? 'text-white' : 'text-blue-400'" class="mr-2 text-lg material-icons-outlined">edit</span>
                              Editar
                            </button>
                          </MenuItem>
                          <MenuItem v-slot="{ active }">
                            <button
                              @click="deleteTask(task.id)"
                              :class="[
                                active ? 'bg-red-500 text-white' : 'text-gray-900',
                                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                              ]"
                            >
                              <span :class="active ? 'text-white' : 'text-red-600'" class="mr-2 text-lg material-icons-outlined">clear</span>
                              Eliminar
                            </button>
                          </MenuItem>
                        </div>
                      </MenuItems>
                    </transition>
                  </Menu>
                </div>
              </div>

              <div class="mb-3 p-3 h-full max-h-20 overflow-auto">
                <p>{{ task.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import clienteAxios from '../config/axios';
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
 } from '@headlessui/vue'

const tasks = ref([]);
const taskForm = ref({ title: '', description: '', status: 'pending' });
const errors = ref([]);
const isEditing = ref(false);
const isOpenModalNotFound = ref(false);
const hoverStatus= ref(null);
let currentTaskId = null;

const getTaskPending = computed(() => {
  return tasks.value.filter(task => task.status === 'pending')
})

const getTaskCompleted = computed(() => {
  return tasks.value.filter(task => task.status === 'completed')
})

onMounted(async () => {
  await fetchTasks();
});

const fetchTasks = async () => {
  console.log(import.meta.env.VITE_VUE_API_URL);
  console.log(import.meta.env.VITE_API_TOKEN_TASK);


  try {
    const { data: {data} } = await clienteAxios.get('/tasks');
    tasks.value = data;
  } catch (error) {
    console.error(error);
  }
};

const submitTask = async () => {
  try {
    if (isEditing.value) {
      await clienteAxios.put(`/tasks/${currentTaskId}`, taskForm.value);
    } else {
      await clienteAxios.post('/tasks', taskForm.value);
    }
    resetForm();
    await fetchTasks();
  } catch (error) {
    if (error.response.status === 404) {
      openModalNotFound();
    } else {
      errors.value = error.response.data.errors
    }
  }
};

const editTask = (task) => {
  errors.value = []
  taskForm.value = { title: task.title, description: task.description};
  isEditing.value = true;
  currentTaskId = task.id;
};

const completedTask = async (task) => {
  isEditing.value = true;
  taskForm.value = {status: 'completed'};
  currentTaskId = task.id;
  await submitTask();
};

const pendingTask = async (task) => {
  isEditing.value = true;
  taskForm.value = {status: 'pending'};
  currentTaskId = task.id;
  await submitTask();
};

const deleteTask = async (id) => {
  try {
    if (currentTaskId) {
      resetForm();
    }
    await clienteAxios.delete(`/tasks/${id}`);
    await fetchTasks();
  } catch (error) {
    console.error(error);
  }
};

const resetForm = () => {
  errors.value = []
  taskForm.value = { title: '', description: '', status: 'pending' };
  isEditing.value = false;
  currentTaskId = null;
  hoverStatus.value = null;
};

function closeModalNotFound() {
  resetForm();
  isOpenModalNotFound.value = false
}
function openModalNotFound() {
  isOpenModalNotFound.value = true
}
</script>
