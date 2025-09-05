import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, Users, Clock, AlertCircle, Trophy, Medal } from 'lucide-react';
import {
  completeScheduleData,
  deportesInfo,
  cursosOptions,
  specialFilterOptions,
  equiposPorCursoDeporte,
} from './data';

const FestivalFundamorApp = () => {
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedSubcurso, setSelectedSubcurso] = useState('');
  const [selectedDeporte, setSelectedDeporte] = useState('');
  const [selectedEquipo, setSelectedEquipo] = useState('');
  const [view, setView] = useState('form');
  const [specialFilter, setSpecialFilter] = useState('');

  const cleanedScheduleData = useMemo(() => {
    let lastValidLocation = '';
    return completeScheduleData
      .filter(event => event.inicio !== 'Inicio') // Filter out header rows
      .map(event => {
        // Clean up "Unnamed" locations
        if (event.ubicacion && !event.ubicacion.startsWith('Unnamed')) {
          lastValidLocation = event.ubicacion;
        }
        return {
          ...event,
          ubicacion: event.ubicacion.startsWith('Unnamed') ? lastValidLocation : event.ubicacion,
        };
      });
  }, []); // Empty dependency array ensures this runs only once

  const cursoCompleto = selectedCurso && selectedSubcurso ? selectedCurso + selectedSubcurso : '';

  const equiposDisponibles = useMemo(() => {
    if (!cursoCompleto || !selectedDeporte) return [];
    const equipos = equiposPorCursoDeporte[cursoCompleto]?.[selectedDeporte] || [];
    return equipos.length > 0 ? equipos : [selectedDeporte + ' ' + cursoCompleto];
  }, [cursoCompleto, selectedDeporte]);

  const subcursosOptions = useMemo(() => {
    if (!selectedCurso) return ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    const subcursosConEventos = new Set();
    cleanedScheduleData.forEach(event => {
      event.cursos.forEach(curso => {
        if (curso.startsWith(selectedCurso)) {
          const subcurso = curso.replace(selectedCurso, '');
          if (subcurso) subcursosConEventos.add(subcurso);
        }
      });
    });

    return Array.from(subcursosConEventos).sort();
  }, [selectedCurso, cleanedScheduleData]);

  const filteredEvents = useMemo(() => {
    let events = cleanedScheduleData.filter(event => {
      if (specialFilter) {
        const matchesSpecialType = event.tipo === specialFilter || event.fase === specialFilter;
        const matchesNivel = !selectedCurso || event.cursos.some(curso => curso.includes(selectedCurso));
        const matchesDeporte = !selectedDeporte || event.deporte === selectedDeporte;
        return matchesSpecialType && matchesNivel && matchesDeporte;
      }

      const matchesCurso = !cursoCompleto || event.cursos.includes(cursoCompleto);
      const matchesDeporte = !selectedDeporte || event.deporte === selectedDeporte;
      const matchesEquipo = !selectedEquipo || event.equipos.some(eq => eq === selectedEquipo);
      return matchesCurso && matchesDeporte && matchesEquipo;
    });

    events.sort((a, b) => {
      const timeA = a.inicio.split(':').map(Number);
      const timeB = b.inicio.split(':').map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });

    return events;
  }, [cursoCompleto, selectedDeporte, selectedEquipo, specialFilter, selectedCurso, cleanedScheduleData]);

  const handleFormSubmit = () => {
    if (specialFilter) {
      if (!selectedCurso) return;
      setView('schedule');
      return;
    }
    if (!cursoCompleto || !selectedDeporte) return;
    if (equiposDisponibles.length > 1 && !selectedEquipo) return;
    setView('schedule');
  };

  const resetForm = () => {
    setSelectedCurso('');
    setSelectedSubcurso('');
    setSelectedDeporte('');
    setSelectedEquipo('');
    setSpecialFilter('');
    setView('form');
  };

  const handleSpecialFilter = (filterType) => {
    if (specialFilter === filterType) {
      setSpecialFilter('');
    } else {
      setSpecialFilter(filterType);
      setSelectedSubcurso('');
      setSelectedDeporte('');
      setSelectedEquipo('');
    }
  };

  if (view === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Festival Fundamor 2025
            </h1>
            <p className="text-lg text-gray-600 mb-4">Encuentra los horarios de tu hijo/a</p>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Ver Fases Especiales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {specialFilterOptions.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  type="button"
                  className={`p-4 border-2 rounded-xl text-left transition-all hover:scale-105 transform ${
                    specialFilter === value
                      ? 'border-yellow-500 bg-yellow-100 shadow-lg'
                      : 'border-yellow-200 hover:border-yellow-300 bg-white hover:shadow-md'
                  }`}
                  onClick={() => handleSpecialFilter(value)}
                >
                  <div className="flex items-center">
                    <Icon className="w-6 h-6 mr-3 text-yellow-600" />
                    <div>
                      <span className="font-semibold text-gray-800">{label}</span>
                      <p className="text-xs text-gray-600 mt-1">{description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              Información de tu hijo/a
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nivel <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nivel-select" className="block text-xs text-gray-500 mb-1">Nivel</label>
                    <select
                      id="nivel-select"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={selectedCurso}
                      onChange={(e) => {
                        setSelectedCurso(e.target.value);
                        if (!specialFilter) {
                          setSelectedSubcurso('');
                        }
                        setSelectedDeporte('');
                        setSelectedEquipo('');
                      }}
                    >
                      <option value="">Selecciona nivel</option>
                      {cursosOptions.map(curso => (
                        <option key={curso} value={curso}>{curso}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="letra-select" className="block text-xs text-gray-500 mb-1">Letra</label>
                    <select
                      id="letra-select"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-50"
                      value={selectedSubcurso}
                      onChange={(e) => {
                        setSelectedSubcurso(e.target.value);
                        setSelectedEquipo('');
                      }}
                      disabled={!selectedCurso || specialFilter}
                    >
                      <option value="">
                        {specialFilter ? 'No requerido para fases especiales' : 'Selecciona letra'}
                      </option>
                      {!specialFilter && subcursosOptions.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Deporte {!specialFilter && <span className="text-red-500">*</span>}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.keys(deportesInfo).map((deporte) => {
                    const info = deportesInfo[deporte];

                    return (
                      <button
                        key={deporte}
                        type="button"
                        className={`p-4 border-2 rounded-xl text-left transition-all hover:scale-105 transform ${
                          selectedDeporte === deporte
                            ? 'border-indigo-500 bg-gradient-to-r ' + info.bgGradient + ' shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                        }`}
                        onClick={() => {
                          setSelectedDeporte(selectedDeporte === deporte ? '' : deporte);
                          setSelectedEquipo('');
                        }}
                      >
                        <div className="flex items-center">
                          <span className="text-3xl mr-3">{info.icon}</span>
                          <div>
                            <span className="font-semibold text-gray-800">{deporte}</span>
                            <p className="text-xs text-gray-600 mt-1">{info.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {equiposDisponibles.length > 1 && !specialFilter && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                    <label htmlFor="equipo-select" className="block text-sm font-medium text-amber-800">
                      Equipo específico <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <p className="text-xs text-amber-700 mb-3">Este curso tiene múltiples equipos</p>
                  <select
                    id="equipo-select"
                    className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={selectedEquipo}
                    onChange={(e) => setSelectedEquipo(e.target.value)}
                  >
                    <option value="">Selecciona equipo</option>
                    {equiposDisponibles.map(equipo => (
                      <option key={equipo} value={equipo}>{equipo}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleFormSubmit}
                disabled={
                  specialFilter ?
                    !selectedCurso :
                    (!cursoCompleto || !selectedDeporte || (equiposDisponibles.length > 1 && !selectedEquipo))
                }
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg disabled:shadow-none"
              >
                {specialFilter ? (
                  selectedCurso ? 'Ver ' + specialFilter + 's - ' + selectedCurso : 'Selecciona un nivel'
                ) : (cursoCompleto && selectedDeporte && (equiposDisponibles.length <= 1 || selectedEquipo)) ? (
                  'Ver Horarios'
                ) : (
                  'Completa la información'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Horarios - {cursoCompleto || 'Filtro especial'}
                </h1>
                <div className="flex items-center space-x-3 mt-2">
                  {selectedDeporte && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${deportesInfo[selectedDeporte]?.color}`}>
                      {deportesInfo[selectedDeporte]?.icon} {selectedDeporte}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {filteredEvents.length} eventos
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg font-medium"
            >
              Cambiar información
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay eventos programados
              </h3>
              <p className="text-gray-600 mb-6">
                No se encontraron eventos con los criterios seleccionados.
              </p>
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Modificar búsqueda
              </button>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all transform hover:scale-[1.02] border-gray-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${deportesInfo[event.deporte]?.color}`}>
                        {deportesInfo[event.deporte]?.icon} {event.deporte}
                      </span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {event.cursos.join(' vs ')}
                      </span>
                      {event.tipo && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          event.tipo === 'final' ? 'bg-yellow-500 text-white' :
                          event.tipo === 'semifinal' ? 'bg-blue-500 text-white' :
                          'bg-purple-500 text-white'
                        }`}>
                          {event.tipo === 'final' ? '🏆 FINAL' :
                           event.tipo === 'semifinal' ? '🥈 SEMIFINAL' :
                           '🏆 PREMIACIÓN'}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {event.descripcion}
                    </h3>

                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-800">{event.ubicacion}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">{event.inicio} - {event.termino}</span>
                      </div>
                      <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-md font-medium">
                        {event.duracion}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {event.equipos.map((equipo, eqIndex) => (
                      <span
                        key={eqIndex}
                        className={`px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedEquipo === equipo
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {equipo}
                      </span>
                    ))}
                  </div>

                  {event.fase && (
                    <div className="mt-3 text-xs text-gray-500">
                      Fase: {event.fase}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-8">
          <div className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm text-gray-600">Desarrollado por</span>
            <a
              href="https://www.tooxs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Tooxs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FestivalFundamorApp;
