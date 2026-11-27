import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewProject.css";

function NewProject() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    projectCode: "",
    projectName: "",
    state: "",
    district: "",
    constituency: "",
    projectType: "Road",

    sanctionedAmount: "",
    expenditure: "",

    startDate: "",
    completionDate: "",
    contractor: "",
    implementingAgency: "",
    status: "Ongoing",

    // Education
    builtUpArea: "",
    classroomCount: "",
    labCount: "",
    libraryAvailable: false,
    toiletCount: "",
    drinkingWaterAvailable: false,
    boundaryWall: false,

    // Road
    roadLengthKm: "",
    roadWidth: "",
    roadType: "",
    shoulderWork: false,
    drainageWork: false,
    culvertCount: "",

    // Water Supply
    capacity: "",
    capacityUnit: "litres",
    waterSource: "",
    supplyType: "",
    beneficiaryCount: "",
    pipelineLengthKm: "",
    storageTank: false,
    treatmentFacility: false,

    // Bridge
    bridgeLengthMeter: "",
    bridgeWidthMeter: "",
    bridgeType: "",
    constructionMaterial: "",
    spanCount: "",
    approachRoad: false,

    // Healthcare
    facilityType: "",
    bedCount: "",
    roomCount: "",
    equipmentCount: "",
    electricityAvailable: false,
    sanitationAvailable: false,

    // Irrigation
    irrigationType: "",
    irrigatedArea: "",
    areaUnit: "hectare",
    canalLengthKm: "",
    pipelineLengthKm: "",
    waterStorageCapacity: "",
    pumpInstalled: false,

    // Electricity
    electricityWorkType: "",
    lineLengthKm: "",
    poleCount: "",
    transformerCount: "",
    transformerCapacityKva: "",
    streetLighting: false,
    solarComponent: false,

    // Generic
    genericBeneficiaryCount: "",
    genericBuiltUpArea: "",
    quantity: "",
    quantityUnit: ""
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const numberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }

    const number = Number(value);

    return Number.isNaN(number) ? null : number;
  };

  const textOrNull = (value) => {
    if (!value || !String(value).trim()) {
      return null;
    }

    return String(value).trim();
  };

  const validateForm = () => {
    if (!form.projectCode.trim()) {
      return "Project code is required.";
    }

    if (!form.projectName.trim()) {
      return "Project name is required.";
    }

    if (form.sanctionedAmount === "") {
      return "Sanctioned amount is required.";
    }

    if (form.expenditure === "") {
      return "Expenditure is required.";
    }

    if (Number(form.sanctionedAmount) < 0) {
      return "Sanctioned amount cannot be negative.";
    }

    if (Number(form.expenditure) < 0) {
      return "Expenditure cannot be negative.";
    }

    if (
      form.startDate &&
      form.completionDate &&
      new Date(form.completionDate) < new Date(form.startDate)
    ) {
      return "Completion date cannot be before start date.";
    }

    return "";
  };

  /*
   * Builds the technical section according to the selected
   * project type.
   */
  const buildTechnicalDetails = () => {
    switch (form.projectType) {
      case "Education":
        return {
          schoolProjectDetails: {
            builtUpArea: numberOrNull(form.builtUpArea),
            classroomCount: numberOrNull(form.classroomCount),
            labCount: numberOrNull(form.labCount),
            libraryAvailable: form.libraryAvailable,
            toiletCount: numberOrNull(form.toiletCount),
            drinkingWaterAvailable:
              form.drinkingWaterAvailable,
            boundaryWall: form.boundaryWall
          }
        };

      case "Road":
        return {
          roadProjectDetails: {
            roadLengthKm: numberOrNull(form.roadLengthKm),
            roadWidth: numberOrNull(form.roadWidth),
            roadType: textOrNull(form.roadType),
            shoulderWork: form.shoulderWork,
            drainageWork: form.drainageWork,
            culvertCount: numberOrNull(form.culvertCount)
          }
        };

      case "Water Supply":
        return {
          waterSupplyProjectDetails: {
            capacity: numberOrNull(form.capacity),
            capacityUnit: textOrNull(form.capacityUnit),
            waterSource: textOrNull(form.waterSource),
            supplyType: textOrNull(form.supplyType),
            beneficiaryCount: numberOrNull(
              form.beneficiaryCount
            ),
            pipelineLengthKm: numberOrNull(
              form.pipelineLengthKm
            ),
            storageTank: form.storageTank,
            treatmentFacility: form.treatmentFacility
          }
        };

      case "Bridge":
        return {
          bridgeProjectDetails: {
            bridgeLengthMeter: numberOrNull(
              form.bridgeLengthMeter
            ),
            bridgeWidthMeter: numberOrNull(
              form.bridgeWidthMeter
            ),
            bridgeType: textOrNull(form.bridgeType),
            constructionMaterial: textOrNull(
              form.constructionMaterial
            ),
            spanCount: numberOrNull(form.spanCount),
            approachRoad: form.approachRoad,
            drainageWork: form.drainageWork
          }
        };

      case "Healthcare":
        return {
          healthProjectDetails: {
            facilityType: textOrNull(form.facilityType),
            bedCount: numberOrNull(form.bedCount),
            builtUpArea: numberOrNull(form.builtUpArea),
            roomCount: numberOrNull(form.roomCount),
            equipmentCount: numberOrNull(
              form.equipmentCount
            ),
            beneficiaryCount: numberOrNull(
              form.beneficiaryCount
            ),
            electricityAvailable:
              form.electricityAvailable,
            drinkingWaterAvailable:
              form.drinkingWaterAvailable,
            sanitationAvailable:
              form.sanitationAvailable
          }
        };

      case "Irrigation":
        return {
          irrigationProjectDetails: {
            irrigationType: textOrNull(
              form.irrigationType
            ),
            irrigatedArea: numberOrNull(
              form.irrigatedArea
            ),
            areaUnit: textOrNull(form.areaUnit),
            canalLengthKm: numberOrNull(
              form.canalLengthKm
            ),
            pipelineLengthKm: numberOrNull(
              form.pipelineLengthKm
            ),
            beneficiaryCount: numberOrNull(
              form.beneficiaryCount
            ),
            waterStorageCapacity: numberOrNull(
              form.waterStorageCapacity
            ),
            waterSource: textOrNull(form.waterSource),
            pumpInstalled: form.pumpInstalled,
            drainageWork: form.drainageWork
          }
        };

      case "Electricity":
        return {
          electricityProjectDetails: {
            electricityWorkType: textOrNull(
              form.electricityWorkType
            ),
            lineLengthKm: numberOrNull(
              form.lineLengthKm
            ),
            poleCount: numberOrNull(form.poleCount),
            transformerCount: numberOrNull(
              form.transformerCount
            ),
            transformerCapacityKva: numberOrNull(
              form.transformerCapacityKva
            ),
            beneficiaryCount: numberOrNull(
              form.beneficiaryCount
            ),
            streetLighting: form.streetLighting,
            solarComponent: form.solarComponent
          }
        };

      case "Sanitation":
      case "Community":
        return {
          genericProjectDetails: {
            beneficiaryCount: numberOrNull(
              form.genericBeneficiaryCount
            ),
            builtUpArea: numberOrNull(
              form.genericBuiltUpArea
            ),
            quantity: numberOrNull(form.quantity),
            quantityUnit: textOrNull(form.quantityUnit)
          }
        };

      default:
        return {};
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      projectCode: form.projectCode.trim(),
      projectName: form.projectName.trim(),

      state: textOrNull(form.state),
      district: textOrNull(form.district),
      constituency: textOrNull(form.constituency),

      projectType: form.projectType,

      sanctionedAmount: Number(form.sanctionedAmount),
      expenditure: Number(form.expenditure),

      startDate: form.startDate || null,
      completionDate: form.completionDate || null,

      contractor: textOrNull(form.contractor),
      implementingAgency: textOrNull(
        form.implementingAgency
      ),

      status: form.status,

      ...buildTechnicalDetails()
    };

    try {
      setSaving(true);

      const response = await fetch(
        "http://localhost:8080/api/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let message = "Unable to create project.";

        if (data?.message) {
          message = data.message;
        } else if (data?.dateRange) {
          message = data.dateRange;
        }

        throw new Error(message);
      }

      if (!data?.id) {
        throw new Error(
          "Project was created but no project ID was returned."
        );
      }

      navigate("/projects/" + data.id);
    } catch (err) {
      setError(
        err.message ||
          "Unable to create project. Make sure Spring Boot is running."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderCheckbox = (name, label) => (
    <label className="checkbox-field">
      <input
        type="checkbox"
        name={name}
        checked={form[name]}
        onChange={handleChange}
      />

      <span>{label}</span>
    </label>
  );

  /*
   * Dynamic technical section
   */
  const renderTechnicalFields = () => {
    switch (form.projectType) {
      /*
       * ROAD
       */
      case "Road":
        return (
          <section className="form-card technical-section">
            <div className="form-card-header">
              <div>
                <span className="form-section-number">
                  04
                </span>

                <div>
                  <h2>Road Technical Details</h2>
                  <p>
                    Road dimensions and infrastructure
                    characteristics
                  </p>
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Road Length (km)</label>

                <input
                  type="number"
                  step="0.01"
                  name="roadLengthKm"
                  value={form.roadLengthKm}
                  onChange={handleChange}
                  placeholder="e.g. 4.5"
                />
              </div>

              <div className="form-field">
                <label>Road Width</label>

                <input
                  type="number"
                  step="0.01"
                  name="roadWidth"
                  value={form.roadWidth}
                  onChange={handleChange}
                  placeholder="Width"
                />
              </div>

              <div className="form-field">
                <label>Road Type</label>

                <input
                  type="text"
                  name="roadType"
                  value={form.roadType}
                  onChange={handleChange}
                  placeholder="e.g. Bituminous"
                />
              </div>

              <div className="form-field">
                <label>Culvert Count</label>

                <input
                  type="number"
                  name="culvertCount"
                  value={form.culvertCount}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="checkbox-grid">
              {renderCheckbox(
                "shoulderWork",
                "Shoulder Work"
              )}

              {renderCheckbox(
                "drainageWork",
                "Drainage Work"
              )}
            </div>
          </section>
        );

      /*
       * WATER SUPPLY
       */
      case "Water Supply":
        return (
          <section className="form-card technical-section">
            <div className="form-card-header">
              <div>
                <span className="form-section-number">
                  04
                </span>

                <div>
                  <h2>Water Supply Details</h2>
                  <p>
                    Capacity, pipeline and beneficiary
                    information
                  </p>
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Capacity</label>

                <input
                  type="number"
                  step="0.01"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="Capacity"
                />
              </div>

              <div className="form-field">
                <label>Capacity Unit</label>

                <select
                  name="capacityUnit"
                  value={form.capacityUnit}
                  onChange={handleChange}
                >
                  <option value="litres">
                    Litres
                  </option>

                  <option value="litres_per_day">
                    Litres / Day
                  </option>

                  <option value="cubic_meter">
                    Cubic Meter
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label>Beneficiary Count</label>

                <input
                  type="number"
                  name="beneficiaryCount"
                  value={form.beneficiaryCount}
                  onChange={handleChange}
                  placeholder="Number of beneficiaries"
                />
              </div>

              <div className="form-field">
                <label>Pipeline Length (km)</label>

                <input
                  type="number"
                  step="0.01"
                  name="pipelineLengthKm"
                  value={form.pipelineLengthKm}
                  onChange={handleChange}
                  placeholder="Pipeline length"
                />
              </div>

              <div className="form-field">
                <label>Water Source</label>

                <input
                  type="text"
                  name="waterSource"
                  value={form.waterSource}
                  onChange={handleChange}
                  placeholder="e.g. Borewell"
                />
              </div>

              <div className="form-field">
                <label>Supply Type</label>

                <input
                  type="text"
                  name="supplyType"
                  value={form.supplyType}
                  onChange={handleChange}
                  placeholder="e.g. Piped Supply"
                />
              </div>
            </div>

            <div className="checkbox-grid">
              {renderCheckbox(
                "storageTank",
                "Storage Tank"
              )}

              {renderCheckbox(
                "treatmentFacility",
                "Treatment Facility"
              )}
            </div>
          </section>
        );

      /*
       * BRIDGE
       */
      case "Bridge":
        return (
          <section className="form-card technical-section">
            <div className="form-card-header">
              <div>
                <span className="form-section-number">
                  04
                </span>

                <div>
                  <h2>Bridge Technical Details</h2>
                  <p>
                    Structural dimensions and construction
                    information
                  </p>
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Bridge Length (meter)</label>

                <input
                  type="number"
                  step="0.01"
                  name="bridgeLengthMeter"
                  value={form.bridgeLengthMeter}
                  onChange={handleChange}
                  placeholder="Length"
                />
              </div>

              <div className="form-field">
                <label>Bridge Width (meter)</label>

                <input
                  type="number"
                  step="0.01"
                  name="bridgeWidthMeter"
                  value={form.bridgeWidthMeter}
                  onChange={handleChange}
                  placeholder="Width"
                />
              </div>

              <div className="form-field">
                <label>Bridge Type</label>

                <input
                  type="text"
                  name="bridgeType"
                  value={form.bridgeType}
                  onChange={handleChange}
                  placeholder="e.g. RCC"
                />
              </div>

              <div className="form-field">
                <label>Construction Material</label>

                <input
                  type="text"
                  name="constructionMaterial"
                  value={form.constructionMaterial}
                  onChange={handleChange}
                  placeholder="e.g. Concrete"
                />
              </div>

              <div className="form-field">
                <label>Span Count</label>

                <input
                  type="number"
                  name="spanCount"
                  value={form.spanCount}
                  onChange={handleChange}
                  placeholder="Number of spans"
                />
              </div>
            </div>

            <div className="checkbox-grid">
              {renderCheckbox(
                "approachRoad",
                "Approach Road"
              )}

              {renderCheckbox(
                "drainageWork",
                "Drainage Work"
              )}
            </div>
          </section>
        );

      /*
       * EDUCATION
       */
      case "Education":
        return (
          <section className="form-card technical-section">
            <div className="form-card-header">
              <div>
                <span className="form-section-number">
                  04
                </span>

                <div>
                  <h2>Education Project Details</h2>
                  <p>
                    Building and facility information
                  </p>
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Built-up Area</label>

                <input
                  type="number"
                  step="0.01"
                  name="builtUpArea"
                  value={form.builtUpArea}
                  onChange={handleChange}
                  placeholder="Area"
                />
              </div>

              <div className="form-field">
                <label>Classroom Count</label>

                <input
                  type="number"
                  name="classroomCount"
                  value={form.classroomCount}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="form-field">
                <label>Lab Count</label>

                <input
                  type="number"
                  name="labCount"
                  value={form.labCount}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="form-field">
                <label>Toilet Count</label>

                <input
                  type="number"
                  name="toiletCount"
                  value={form.toiletCount}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="checkbox-grid">
              {renderCheckbox(
                "libraryAvailable",
                "Library Available"
              )}

              {renderCheckbox(
                "drinkingWaterAvailable",
                "Drinking Water Available"
              )}

              {renderCheckbox(
                "boundaryWall",
                "Boundary Wall"
              )}
            </div>
          </section>
        );

      /*
       * HEALTHCARE
       */
      case "Healthcare":
        return (
          <section className="form-card technical-section">
            <div className="form-card-header">
              <div>
                <span className="form-section-number">
                  04
                </span>

                <div>
                  <h2>Healthcare Project Details</h2>
                  <p>
                    Facility capacity and beneficiary
                    information
                  </p>
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Facility Type</label>

                <input
                  type="text"
                  name="facilityType"
                  value={form.facilityType}
                  onChange={handleChange}
                  placeholder="e.g. Primary Health Centre"
                />
              </div>

              <div className="form-field">
                <label>Bed Count</label>

                <input
                  type="number"
                  name="bedCount"
                  value={form.bedCount}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="form-field">
                <label>Built-up Area</label>

                <input
                  type="number"
                  step="0.01"
                  name="builtUpArea"
                  value={form.builtUpArea}
                  onChange={handleChange}
                  placeholder="Area"
                />
              </div>

              <div className="form-field">
                <label>Room Count</label>

                <input
                  type="number"
                  name="roomCount"
                  value={form.roomCount}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="form-field">
                <label>Equipment Count</label>

                <input
                  type="number"
                  name="equipmentCount"
                  value={form.equipmentCount}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="form-field">
                <label>Beneficiary Count</label>

                <input
                  type="number"
                  name="beneficiaryCount"
                  value={form.beneficiaryCount}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="checkbox-grid">
              {renderCheckbox(
                "electricityAvailable",
                "Electricity Available"
              )}

              {renderCheckbox(
                "drinkingWaterAvailable",
                "Drinking Water Available"
              )}

              {renderCheckbox(
                "sanitationAvailable",
                "Sanitation Available"
              )}
            </div>
          </section>
        );

      /*
       * IRRIGATION
       */
      case "Irrigation":
        return (
          <section className="form-card technical-section">
            <div className="form-card-header">
              <div>
                <span className="form-section-number">
                  04
                </span>

                <div>
                  <h2>Irrigation Project Details</h2>
                  <p>
                    Area, water infrastructure and
                    beneficiary information
                  </p>
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Irrigation Type</label>

                <input
                  type="text"
                  name="irrigationType"
                  value={form.irrigationType}
                  onChange={handleChange}
                  placeholder="e.g. Canal"
                />
              </div>

              <div className="form-field">
                <label>Irrigated Area</label>

                <input
                  type="number"
                  step="0.01"
                  name="irrigatedArea"
                  value={form.irrigatedArea}
                  onChange={handleChange}
                  placeholder="Area"
                />
              </div>

              <div className="form-field">
                <label>Area Unit</label>

                <select
                  name="areaUnit"
                  value={form.areaUnit}
                  onChange={handleChange}
                >
                  <option value="hectare">
                    Hectare
                  </option>

                  <option value="acre">
                    Acre
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label>Canal Length (km)</label>

                <input
                  type="number"
                  step="0.01"
                  name="canalLengthKm"
                  value={form.canalLengthKm}
                  onChange={handleChange}
                  placeholder="Length"
                />
              </div>

              <div className="form-field">
                <label>Pipeline Length (km)</label>

                <input
                  type="number"
                  step="0.01"
                  name="pipelineLengthKm"
                  value={form.pipelineLengthKm}
                  onChange={handleChange}
                  placeholder="Length"
                />
              </div>

              <div className="form-field">
                <label>Beneficiary Count</label>

                <input
                  type="number"
                  name="beneficiaryCount"
                  value={form.beneficiaryCount}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="form-field">
                <label>Water Storage Capacity</label>

                <input
                  type="number"
                  step="0.01"
                  name="waterStorageCapacity"
                  value={form.waterStorageCapacity}
                  onChange={handleChange}
                  placeholder="Capacity"
                />
              </div>

              <div className="form-field">
                <label>Water Source</label>

                <input
                  type="text"
                  name="waterSource"
                  value={form.waterSource}
                  onChange={handleChange}
                  placeholder="Source"
                />
              </div>
            </div>

            <div className="checkbox-grid">
              {renderCheckbox(
                "pumpInstalled",
                "Pump Installed"
              )}

              {renderCheckbox(
                "drainageWork",
                "Drainage Work"
              )}
            </div>
          </section>
        );

      /*
       * ELECTRICITY
       */
      case "Electricity":
        return (
          <section className="form-card technical-section">
            <div className="form-card-header">
              <div>
                <span className="form-section-number">
                  04
                </span>

                <div>
                  <h2>Electricity Project Details</h2>
                  <p>
                    Network infrastructure and beneficiary
                    information
                  </p>
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Electricity Work Type</label>

                <input
                  type="text"
                  name="electricityWorkType"
                  value={form.electricityWorkType}
                  onChange={handleChange}
                  placeholder="e.g. Line Extension"
                />
              </div>

              <div className="form-field">
                <label>Line Length (km)</label>

                <input
                  type="number"
                  step="0.01"
                  name="lineLengthKm"
                  value={form.lineLengthKm}
                  onChange={handleChange}
                  placeholder="Length"
                />
              </div>

              <div className="form-field">
                <label>Pole Count</label>

                <input
                  type="number"
                  name="poleCount"
                  value={form.poleCount}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="form-field">
                <label>Transformer Count</label>

                <input
                  type="number"
                  name="transformerCount"
                  value={form.transformerCount}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="form-field">
                <label>
                  Transformer Capacity (kVA)
                </label>

                <input
                  type="number"
                  step="0.01"
                  name="transformerCapacityKva"
                  value={form.transformerCapacityKva}
                  onChange={handleChange}
                  placeholder="Capacity"
                />
              </div>

              <div className="form-field">
                <label>Beneficiary Count</label>

                <input
                  type="number"
                  name="beneficiaryCount"
                  value={form.beneficiaryCount}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="checkbox-grid">
              {renderCheckbox(
                "streetLighting",
                "Street Lighting"
              )}

              {renderCheckbox(
                "solarComponent",
                "Solar Component"
              )}
            </div>
          </section>
        );

      /*
       * SANITATION / COMMUNITY
       */
      case "Sanitation":
      case "Community":
        return (
          <section className="form-card technical-section">
            <div className="form-card-header">
              <div>
                <span className="form-section-number">
                  04
                </span>

                <div>
                  <h2>
                    {form.projectType} Project Details
                  </h2>

                  <p>
                    Scale and beneficiary information
                  </p>
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Beneficiary Count</label>

                <input
                  type="number"
                  name="genericBeneficiaryCount"
                  value={form.genericBeneficiaryCount}
                  onChange={handleChange}
                  placeholder="Number of beneficiaries"
                />
              </div>

              <div className="form-field">
                <label>Built-up Area</label>

                <input
                  type="number"
                  step="0.01"
                  name="genericBuiltUpArea"
                  value={form.genericBuiltUpArea}
                  onChange={handleChange}
                  placeholder="Area"
                />
              </div>

              <div className="form-field">
                <label>Quantity</label>

                <input
                  type="number"
                  step="0.01"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="Quantity"
                />
              </div>

              <div className="form-field">
                <label>Quantity Unit</label>

                <input
                  type="text"
                  name="quantityUnit"
                  value={form.quantityUnit}
                  onChange={handleChange}
                  placeholder="e.g. units"
                />
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="new-project-page">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/projects")}
          >
            ← Back to Projects
          </button>

          <h1>Create New Project</h1>

          <p>
            Add a project for project intelligence and
            risk analysis.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="form-error">
          <span>⚠</span>

          <div>
            <strong>Unable to create project</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* PROJECT INFORMATION */}
        <section className="form-card">

          <div className="form-card-header">
            <div>
              <span className="form-section-number">
                01
              </span>

              <div>
                <h2>Project Information</h2>
                <p>
                  Basic project identification and
                  classification
                </p>
              </div>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-field">
              <label>
                Project Code <span>*</span>
              </label>

              <input
                type="text"
                name="projectCode"
                value={form.projectCode}
                onChange={handleChange}
                placeholder="e.g. MPLAD-1651"
              />
            </div>

            <div className="form-field">
              <label>
                Project Name <span>*</span>
              </label>

              <input
                type="text"
                name="projectName"
                value={form.projectName}
                onChange={handleChange}
                placeholder="Enter project name"
              />
            </div>

            <div className="form-field">
              <label>Project Type</label>

              <select
                name="projectType"
                value={form.projectType}
                onChange={handleChange}
              >
                <option value="Road">
                  Road
                </option>

                <option value="Water Supply">
                  Water Supply
                </option>

                <option value="Bridge">
                  Bridge
                </option>

                <option value="Education">
                  Education
                </option>

                <option value="Healthcare">
                  Healthcare
                </option>

                <option value="Irrigation">
                  Irrigation
                </option>

                <option value="Electricity">
                  Electricity
                </option>

                <option value="Sanitation">
                  Sanitation
                </option>

                <option value="Community">
                  Community
                </option>
              </select>
            </div>

            <div className="form-field">
              <label>State</label>

              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="e.g. Madhya Pradesh"
              />
            </div>

            <div className="form-field">
              <label>District</label>

              <input
                type="text"
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="Enter district"
              />
            </div>

            <div className="form-field">
              <label>Constituency</label>

              <input
                type="text"
                name="constituency"
                value={form.constituency}
                onChange={handleChange}
                placeholder="Enter constituency"
              />
            </div>

          </div>
        </section>

        {/* FINANCIAL */}
        <section className="form-card">

          <div className="form-card-header">
            <div>
              <span className="form-section-number">
                02
              </span>

              <div>
                <h2>Financial Information</h2>

                <p>
                  Sanctioned and utilized project funds
                </p>
              </div>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-field">
              <label>
                Sanctioned Amount <span>*</span>
              </label>

              <input
                type="number"
                name="sanctionedAmount"
                value={form.sanctionedAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>

            <div className="form-field">
              <label>
                Expenditure <span>*</span>
              </label>

              <input
                type="number"
                name="expenditure"
                value={form.expenditure}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>

          </div>

          <div className="form-info">
            <span>ⓘ</span>

            <p>
              Financial values are used by the intelligence
              engine to evaluate expenditure and utilization
              patterns.
            </p>
          </div>

        </section>

        {/* TIMELINE */}
        <section className="form-card">

          <div className="form-card-header">
            <div>
              <span className="form-section-number">
                03
              </span>

              <div>
                <h2>
                  Timeline & Implementation
                </h2>

                <p>
                  Execution period and implementation
                  details
                </p>
              </div>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-field">
              <label>Start Date</label>

              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Completion Date</label>

              <input
                type="date"
                name="completionDate"
                value={form.completionDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Ongoing">
                  Ongoing
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Delayed">
                  Delayed
                </option>
              </select>
            </div>

            <div className="form-field">
              <label>Contractor</label>

              <input
                type="text"
                name="contractor"
                value={form.contractor}
                onChange={handleChange}
                placeholder="Contractor"
              />
            </div>

            <div className="form-field">
              <label>Implementing Agency</label>

              <input
                type="text"
                name="implementingAgency"
                value={form.implementingAgency}
                onChange={handleChange}
                placeholder="Implementing agency"
              />
            </div>

          </div>
        </section>

        {/* DYNAMIC TECHNICAL SECTION */}
        {renderTechnicalFields()}

        {/* FOOTER */}
        <div className="form-footer">

          <div className="form-footer-note">
            <span>✦</span>

            <p>
              Technical project attributes improve
              comparable project analysis and risk
              assessment.
            </p>
          </div>

          <div className="form-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/projects")}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Creating Project..."
                : "Create Project →"}
            </button>

          </div>

        </div>

      </form>
    </div>
  );
}

export default NewProject;