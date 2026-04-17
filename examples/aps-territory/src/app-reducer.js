import {createAction, handleActions} from 'redux-actions';

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const TERRITORY_COLORS = [
  '#E53935', '#8E24AA', '#1E88E5', '#00897B',
  '#43A047', '#FB8C00', '#6D4C41', '#00ACC1'
];

const APS_SET_TAB = 'APS_SET_TAB';
const APS_SET_SELECTED = 'APS_SET_SELECTED';
const APS_ADD_TERRITORY = 'APS_ADD_TERRITORY';
const APS_UPDATE_TERRITORY = 'APS_UPDATE_TERRITORY';
const APS_DELETE_TERRITORY = 'APS_DELETE_TERRITORY';
const APS_ADD_MICROAREA = 'APS_ADD_MICROAREA';
const APS_UPDATE_MICROAREA = 'APS_UPDATE_MICROAREA';
const APS_DELETE_MICROAREA = 'APS_DELETE_MICROAREA';
const APS_ADD_TEAM = 'APS_ADD_TEAM';
const APS_UPDATE_TEAM = 'APS_UPDATE_TEAM';
const APS_DELETE_TEAM = 'APS_DELETE_TEAM';
const APS_ADD_MEMBER = 'APS_ADD_MEMBER';
const APS_DELETE_MEMBER = 'APS_DELETE_MEMBER';
const APS_ADD_FAMILY = 'APS_ADD_FAMILY';
const APS_UPDATE_FAMILY = 'APS_UPDATE_FAMILY';
const APS_DELETE_FAMILY = 'APS_DELETE_FAMILY';
const APS_IMPORT_FAMILIES = 'APS_IMPORT_FAMILIES';
const APS_ADD_PATIENT = 'APS_ADD_PATIENT';
const APS_UPDATE_PATIENT = 'APS_UPDATE_PATIENT';
const APS_DELETE_PATIENT = 'APS_DELETE_PATIENT';

export const setTab = createAction(APS_SET_TAB);
export const setSelected = createAction(APS_SET_SELECTED);
export const addTerritory = createAction(APS_ADD_TERRITORY);
export const updateTerritory = createAction(APS_UPDATE_TERRITORY);
export const deleteTerritory = createAction(APS_DELETE_TERRITORY);
export const addMicroarea = createAction(APS_ADD_MICROAREA);
export const updateMicroarea = createAction(APS_UPDATE_MICROAREA);
export const deleteMicroarea = createAction(APS_DELETE_MICROAREA);
export const addTeam = createAction(APS_ADD_TEAM);
export const updateTeam = createAction(APS_UPDATE_TEAM);
export const deleteTeam = createAction(APS_DELETE_TEAM);
export const addMember = createAction(APS_ADD_MEMBER);
export const deleteMember = createAction(APS_DELETE_MEMBER);
export const addFamily = createAction(APS_ADD_FAMILY);
export const updateFamily = createAction(APS_UPDATE_FAMILY);
export const deleteFamily = createAction(APS_DELETE_FAMILY);
export const importFamilies = createAction(APS_IMPORT_FAMILIES);
export const addPatient = createAction(APS_ADD_PATIENT);
export const updatePatient = createAction(APS_UPDATE_PATIENT);
export const deletePatient = createAction(APS_DELETE_PATIENT);

const initialState = {
  territories: [],
  microareas: [],
  teams: [],
  families: [],
  patients: [],
  activeTab: 'territories',
  selectedTerritoryId: null,
  selectedMicroareaId: null
};

const appReducer = handleActions(
  {
    [APS_SET_TAB]: (state, {payload}) => ({...state, activeTab: payload}),
    [APS_SET_SELECTED]: (state, {payload}) => ({...state, ...payload}),

    [APS_ADD_TERRITORY]: (state, {payload}) => ({
      ...state,
      territories: [...state.territories, {
        id: uuid(), createdAt: new Date().toISOString(),
        color: TERRITORY_COLORS[state.territories.length % TERRITORY_COLORS.length],
        ...payload
      }]
    }),
    [APS_UPDATE_TERRITORY]: (state, {payload}) => ({
      ...state,
      territories: state.territories.map(t => t.id === payload.id ? {...t, ...payload} : t)
    }),
    [APS_DELETE_TERRITORY]: (state, {payload}) => {
      const maIds = state.microareas.filter(m => m.territoryId === payload).map(m => m.id);
      return {
        ...state,
        territories: state.territories.filter(t => t.id !== payload),
        microareas: state.microareas.filter(m => m.territoryId !== payload),
        teams: state.teams.filter(t => t.territoryId !== payload),
        families: state.families.filter(f => !maIds.includes(f.microareaId)),
        patients: state.patients.filter(p => {
          const fam = state.families.find(f => f.id === p.familyId);
          return fam && !maIds.includes(fam.microareaId);
        })
      };
    },

    [APS_ADD_MICROAREA]: (state, {payload}) => ({
      ...state,
      microareas: [...state.microareas, {id: uuid(), createdAt: new Date().toISOString(), ...payload}]
    }),
    [APS_UPDATE_MICROAREA]: (state, {payload}) => ({
      ...state,
      microareas: state.microareas.map(m => m.id === payload.id ? {...m, ...payload} : m)
    }),
    [APS_DELETE_MICROAREA]: (state, {payload}) => ({
      ...state,
      microareas: state.microareas.filter(m => m.id !== payload),
      families: state.families.filter(f => f.microareaId !== payload)
    }),

    [APS_ADD_TEAM]: (state, {payload}) => ({
      ...state,
      teams: [...state.teams, {id: uuid(), createdAt: new Date().toISOString(), members: [], ...payload}]
    }),
    [APS_UPDATE_TEAM]: (state, {payload}) => ({
      ...state,
      teams: state.teams.map(t => t.id === payload.id ? {...t, ...payload} : t)
    }),
    [APS_DELETE_TEAM]: (state, {payload}) => ({
      ...state, teams: state.teams.filter(t => t.id !== payload)
    }),
    [APS_ADD_MEMBER]: (state, {payload}) => ({
      ...state,
      teams: state.teams.map(t =>
        t.id === payload.teamId ? {...t, members: [...t.members, {id: uuid(), ...payload}]} : t
      )
    }),
    [APS_DELETE_MEMBER]: (state, {payload}) => ({
      ...state,
      teams: state.teams.map(t => ({...t, members: t.members.filter(m => m.id !== payload)}))
    }),

    [APS_ADD_FAMILY]: (state, {payload}) => ({
      ...state,
      families: [...state.families, {
        id: uuid(), createdAt: new Date().toISOString(),
        socialVulnerability: 'baixa', memberCount: 1, ...payload
      }]
    }),
    [APS_UPDATE_FAMILY]: (state, {payload}) => ({
      ...state,
      families: state.families.map(f => f.id === payload.id ? {...f, ...payload} : f)
    }),
    [APS_DELETE_FAMILY]: (state, {payload}) => ({
      ...state,
      families: state.families.filter(f => f.id !== payload),
      patients: state.patients.filter(p => p.familyId !== payload)
    }),
    [APS_IMPORT_FAMILIES]: (state, {payload}) => ({
      ...state,
      families: [...state.families, ...payload.map(f => ({
        id: uuid(), createdAt: new Date().toISOString(),
        socialVulnerability: f.socialVulnerability || 'baixa',
        memberCount: parseInt(f.memberCount, 10) || 1, ...f
      }))]
    }),

    [APS_ADD_PATIENT]: (state, {payload}) => ({
      ...state,
      patients: [...state.patients, {
        id: uuid(), createdAt: new Date().toISOString(),
        conditions: [], gender: 'F', ...payload
      }]
    }),
    [APS_UPDATE_PATIENT]: (state, {payload}) => ({
      ...state,
      patients: state.patients.map(p => p.id === payload.id ? {...p, ...payload} : p)
    }),
    [APS_DELETE_PATIENT]: (state, {payload}) => ({
      ...state, patients: state.patients.filter(p => p.id !== payload)
    })
  },
  initialState
);

export default appReducer;
