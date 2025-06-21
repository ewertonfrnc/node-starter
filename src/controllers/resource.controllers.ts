import { Request, Response } from 'express';

export function getAllResource(_req: Request, res: Response) {
  const resources = [
    { id: 1, name: 'Resource One' },
    { id: 2, name: 'Resource Two' },
    { id: 3, name: 'Resource Three' },
  ];
  res.status(200).json(resources);
}

export function getResourceById(req: Request, res: Response) {
  const resourceId = parseInt(req.params.id, 10);
  const resources = [
    { id: 1, name: 'Resource One' },
    { id: 2, name: 'Resource Two' },
    { id: 3, name: 'Resource Three' },
  ];

  const resource = resources.find((r) => r.id === resourceId);

  if (resource) {
    res.status(200).json(resource);
  } else {
    res.status(404).json({ message: 'Resource not found' });
  }
}

export function createResource(req: Request, res: Response) {
  const newResource = req.body;
  // Here you would typically save the resource to a database
  newResource.id = Math.floor(Math.random() * 1000); // Simulating an ID assignment
  res.status(201).json(newResource);
}
