//@ts-nocheck

const ProjectList = ({ projects, projectSize }) => (
  <>
    {projects.map((project) => (
      <div
        key={project.id}
        className="absolute p-4 bg-white shadow-lg rounded-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105"
        style={{
          left: project.x,
          top: project.y,
          width: projectSize.width,
          height: projectSize.height,
        }}
      >
        <h3 className="text-lg text-gray-800 font-bold mb-2">
          {project.title}
        </h3>
        <p className="text-gray-600 text-sm">{project.description}</p>
      </div>
    ))}
  </>
);

export default ProjectList;
